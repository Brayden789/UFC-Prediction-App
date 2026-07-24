import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFighters, searchFighters, getWeightClasses, getFightersByWeightClass } from '../services/api'

function Fighters() {
    // State variables to manage fighters, weight classes, selected class, search query, and loading state
  const [fighters, setFighters] = useState([])
  const [weightClasses, setWeightClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // useEffect runs code automatically when the page first loads
  // this makes sure we get the weight classes and fighters from the API when the page loads
  useEffect(() => {
    getWeightClasses()
      .then(res => setWeightClasses(res.data))
      .catch(err => console.error(err))

    loadFighters()
  }, [])
  //the [] is important it makes sure this runs once when the page loads and not every time the page updates

  const loadFighters = () => {
    setLoading(true)
    getFighters(100, 0)
      .then(res => setFighters(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)
    setSelectedClass('All')

    if (value.length < 2) {
      loadFighters()
      return
    }

    setLoading(true)
    try {
      const res = await searchFighters(value)
      setFighters(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleWeightClass = async (weightClass) => {
    setSelectedClass(weightClass)
    setQuery('')
    setLoading(true)

    try {
      if (weightClass === 'All') {
        const res = await getFighters(100, 0)
        setFighters(res.data)
      } else {
        const res = await getFightersByWeightClass(weightClass)
        setFighters(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', marginBottom: '8px' }}>
        FIGHTERS
      </h1>
      <p style={{ color: 'var(--muted)', marginBottom: '32px' }}>
        Browse all {fighters.length} fighters in the database
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search fighter name..."
        value={query}
        onChange={handleSearch}
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
          marginBottom: '24px',
        }}
      />

{/* Weight Class Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {['All', ...weightClasses.map(wc => wc.weight_class)].map((wc) => (
          <button
            key={wc}
            onClick={() => handleWeightClass(wc)}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              backgroundColor: selectedClass === wc ? 'var(--red)' : 'var(--surface)',
              color: selectedClass === wc ? 'white' : 'var(--muted)',
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

      {/* Fighters Grid */}
      {loading ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '64px' }}>Loading...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
        }}>
          {fighters.map((fighter) => (
            <div
              key={fighter.fighter_id}
              onClick={() => navigate(`/fighters/${fighter.fighter_id}`)}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: '3px solid var(--red)',
                borderRadius: '4px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2A2A2A'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface)'}
            >
              <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '22px', marginBottom: '8px' }}>
                {fighter.name}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{fighter.weight_class || 'Unknown'}</span>
                <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{fighter.nationality || ''}</span>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: '700' }}>{fighter.wins}W</span>
                <span style={{ fontSize: '13px', color: '#f87171', fontWeight: '700' }}>{fighter.losses}L</span>
                {fighter.draws > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '700' }}>{fighter.draws}D</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Fighters