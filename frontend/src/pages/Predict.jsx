import { useState, useEffect } from 'react'

import { searchFighters, getWeightClasses, getFightersByWeightClass } from '../services/api'


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

  // Fetch weight classes once when the page loads, same pattern as the Fighters page
useEffect(() => {
  getWeightClasses()
    .then(res => setWeightClasses(res.data))
    .catch(err => console.error(err))
}, [])


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

  if (mode === 'weightclass') {
    // Filter the already-loaded weight class fighters locally instead of calling the API
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

    </div>
  )
}

export default Predict