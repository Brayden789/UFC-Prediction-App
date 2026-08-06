import { useState, useEffect } from 'react'

import { searchFighters, getWeightClasses, getFightersByWeightClass, predictFight } from '../services/api'


function Predict() {
  const [mode, setMode] = useState('p4p')
  const [weightClasses, setWeightClasses] = useState([])
  const [selectedWeightClass, setSelectedWeightClass] = useState('')

  const [fighterA, setFighterA] = useState(null)
  const [fighterB, setFighterB] = useState(null)

  const [queryA, setQueryA] = useState('')
  const [queryB, setQueryB] = useState('')

  const [resultsA, setResultsA] = useState([])
  const [resultsB, setResultsB] = useState([])
  // State variable to hold fighters filtered by selected weight class
  const [weightClassFighters, setWeightClassFighters] = useState([])
  const [prediction, setPrediction] = useState(null)

  // Fetch weight classes once when the page loads, same pattern as the Fighters page
useEffect(() => {
  getWeightClasses()
    .then(res => setWeightClasses(res.data))
    .catch(err => console.error(err))
}, [])
//updtating the actual logic to use the ML training
const handlePredict = async () => {
  try{
    const res = await predictFight(fighterA.fighter_id, fighterB.fighter_id)
    const {winner, confidence} = res.data

    const winningfighter = winner === 'Red' ? fighterA : fighterB

    setPrediction({ winner: winningfighter, confidence })
  } catch (err) {
    console.error(err)
  }
}

const handleSelectWeightClass = async (weightClass) => {
  setSelectedWeightClass(weightClass)
  setFighterA(null)
  setFighterB(null)
  setQueryA('')
  setQueryB('')

  try {
    const res = await getFightersByWeightClass(weightClass)
    setWeightClassFighters(res.data)
  } catch (err) {
    console.error(err)
  }
}

// Search handlers for Fighter A and Fighter B, similar to the Home page search handler
const handleSearchA = async (e) => {
  const value = e.target.value
  setQueryA(value)

  if (value.length < 2) {
    setResultsA([])
    return
  }
//make sure its weight class mode if it is then filter the fighters by the weight class and then filter by the search query if its not then just search the api for the fighter
  if (mode === 'weightclass') {
    const filtered = weightClassFighters.filter(fighter =>
      fighter.name.toLowerCase().includes(value.toLowerCase())
    )
    setResultsA(filtered.slice(0, 6))
  } else {
    try {
      const res = await searchFighters(value)
      setResultsA(res.data.slice(0, 6))
    } catch (err) {
      console.error(err)
    }
  }
}

const handleSearchB = async (e) => {
  const value = e.target.value
  setQueryB(value)

  if (value.length < 2) {
    setResultsB([])
    return
  }

  if (mode === 'weightclass') {
    const filtered = weightClassFighters.filter(fighter =>
      fighter.name.toLowerCase().includes(value.toLowerCase())
    )
    setResultsB(filtered.slice(0, 6))
  } else {
    try {
      const res = await searchFighters(value)
      setResultsB(res.data.slice(0, 6))
    } catch (err) {
      console.error(err)
    }
  }
}
// Select handlers for Fighter A and Fighter B, which set the selected fighter and update the query and results then saves the fighter as an object to be used in the prediction model
const selectFighterA = (fighter) => {
  setFighterA(fighter)
  setQueryA(fighter.name)
  setResultsA([])
}

const selectFighterB = (fighter) => {
  setFighterB(fighter)
  setQueryB(fighter.name)
  setResultsB([])
}


  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <button
          onClick={() => setMode('p4p')}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            backgroundColor: mode === 'p4p' ? 'var(--red)' : 'var(--surface)',
            color: mode === 'p4p' ? 'white' : 'var(--muted)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Pound-for-Pound
        </button>

        <button
          onClick={() => setMode('weightclass')}
          style={{
            padding: '10px 20px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            backgroundColor: mode === 'weightclass' ? 'var(--red)' : 'var(--surface)',
            color: mode === 'weightclass' ? 'white' : 'var(--muted)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          By Weight Class
        </button>
      </div>

      {/* Weight Class Picker - only shows when in weightclass mode */}
      {mode === 'weightclass' && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {weightClasses.map(wc => wc.weight_class).map((wc) => (
            <button
              key={wc}
              onClick={() => handleSelectWeightClass(wc)}
              style={{
                padding: '6px 16px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                backgroundColor: selectedWeightClass === wc ? 'var(--red)' : 'var(--surface)',
                color: selectedWeightClass === wc ? 'white' : 'var(--muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
              }}
            >
              {wc}
            </button>
          ))}
        </div>
      )}

      {/* Fighter Search Boxes */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>

        {/* Fighter A search */}
        <div style={{ flex: '1', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search Fighter A..."
            value={queryA}
            onChange={handleSearchA}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          {resultsA.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              zIndex: 10,
            }}>
              {resultsA.map((fighter) => (
                <div
                  key={fighter.fighter_id}
                  onClick={() => selectFighterA(fighter)}
                  style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                  {fighter.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fighter B search */}
        <div style={{ flex: '1', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search Fighter B..."
            value={queryB}
            onChange={handleSearchB}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          {resultsB.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              zIndex: 10,
            }}>
              {resultsB.map((fighter) => (
                <div
                  key={fighter.fighter_id}
                  onClick={() => selectFighterB(fighter)}
                  style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                  {fighter.name}
                </div>
              ))}
            </div>
          )}
</div>

      </div>

      {/* VS Display - only shows once both fighters are selected */}
      {fighterA && fighterB && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px' }}>
              {fighterA.name}
            </h2>
            <span style={{ color: 'var(--red)', fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px' }}>
              VS
            </span>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px' }}>
              {fighterB.name}
            </h2>
          </div>

          <button
            onClick={handlePredict}
            style={{
              marginTop: '24px',
              padding: '12px 32px',
              backgroundColor: 'var(--red)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: '18px',
              letterSpacing: '0.05em',
              cursor: 'pointer',
            }}
          >
            PREDICT WINNER
          </button>
        </div>
      )}

      {prediction && (
        <div style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--gold)',
          borderRadius: '4px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--muted)', fontSize: '13px', letterSpacing: '0.15em', marginBottom: '8px' }}>
            PREDICTED WINNER
          </p>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '40px', color: 'var(--gold)', marginBottom: '8px' }}>
            {prediction.winner.name}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            {prediction.confidence}% confidence
          </p>
        </div>
      )}

    </div>
  )
}

export default Predict