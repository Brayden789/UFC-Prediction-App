import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchFighters } from '../services/api'

//State variables which store 2 things the current value and function to update it, querry store what the user is typing setqurry updates the each time the user types
//results stores the fighters from the api when we type in the search bar and setresults updates it each time we get a new result from the api
//just check if it loading
function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  //this will send a user to a new page
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const response = await searchFighters(value)
      //make the dropdown only 6 results
      setResults(response.data.slice(0, 6))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    // Outer wrapper - flex column so hero grows and stats sit at the bottom naturally
    <div style={{
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1a0000 50%, #0A0A0A 100%)',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Hero Section - flex:1 makes it fill all available space, pushing stats to bottom */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}>
        <p style={{ color: 'var(--red)', fontFamily: 'Inter', fontWeight: '600', letterSpacing: '0.2em', fontSize: '14px', marginBottom: '16px' }}>
          MMA FIGHT PREDICTION ENGINE
        </p>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '80px', lineHeight: '1', marginBottom: '16px', letterSpacing: '0.05em' }}>
          WHO WINS <span style={{ color: 'var(--red)' }}>THE FIGHT?</span>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '18px', maxWidth: '500px', margin: '0 auto 48px' }}>
          Search any UFC fighter to view their stats, fight history, and head-to-head predictions.
        </p>

        {/* Search Box */}
        <div style={{ position: 'relative', maxWidth: '520px', width: '100%', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search fighter name..."
            value={query}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '16px 24px',
              backgroundColor: 'var(--surface)',
              border: '2px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text)',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          {/* Dropdown Results */}
          {results.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              zIndex: 10,
            }}>
              {results.map((fighter) => (
                <div
                  key={fighter.fighter_id}
                  onClick={() => navigate(`/fighters/${fighter.fighter_id}`)}
                  style={{
                    padding: '12px 24px',
                    cursor: 'pointer',
                    borderLeft: '3px solid transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#2A2A2A'
                    e.currentTarget.style.borderLeftColor = 'var(--red)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderLeftColor = 'transparent'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{fighter.name}</span>
                  <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{fighter.weight_class}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar - sits naturally at the bottom because hero above uses flex:1 */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        gap: '64px',
      }}>
        {[
          { label: 'FIGHTERS', value: '3,596' },
          { label: 'FIGHTS', value: '6,012' },
          { label: 'WEIGHT CLASSES', value: '12' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '36px', color: 'var(--red)' }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.15em' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Home