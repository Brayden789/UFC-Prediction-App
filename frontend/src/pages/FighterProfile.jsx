import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFighter, getFighterFights, getFighterRecord } from '../services/api'

function FighterProfile() {
  // useParams reads the dynamic part of the URL - e.g. /fighters/42 gives us { id: '42' }
  const { id } = useParams()
  const navigate = useNavigate()

  const [fighter, setFighter] = useState(null)
  const [record, setRecord] = useState(null)
  const [fights, setFights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFighterData()
  }, [id])
  //has id in the box beacuse it needs to load tghe fighter data again when the page is loaded to a new fighter

  const loadFighterData = async () => {
    setLoading(true)
    try {
      // First get the fighter's basic info using their ID
      const fighterRes = await getFighter(id)
      setFighter(fighterRes.data)

      // The record and fights endpoints need the fighter's NAME, not ID
      // so we use the name we just got back from getFighter
      const name = fighterRes.data.name

      const [recordRes, fightsRes] = await Promise.all([
        getFighterRecord(name),
        getFighterFights(name),
      ])

      setRecord(recordRes.data)
      setFights(fightsRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
//we make sure to check these states before we try to render a page aswell
  if (loading) {
    return <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '64px' }}>Loading...</p>
  }

  if (!fighter) {
    return <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '64px' }}>Fighter not found</p>
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/fighters')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '24px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        ← Back to Fighters
      </button>

      {/* Fighter Header */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderLeft: '4px solid var(--red)',
        borderRadius: '4px',
        padding: '32px',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '48px', marginBottom: '8px' }}>
          {fighter.name}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '24px' }}>
          {fighter.weight_class || 'Unknown Weight Class'} {fighter.nationality ? `· ${fighter.nationality}` : ''}
        </p>

        {/* Record display */}
        {record && (
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#4ade80' }}>
                {record.wins}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.1em' }}>WINS</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: '#f87171' }}>
                {record.losses}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.1em' }}>LOSSES</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: 'var(--muted)' }}>
                {record.no_contests}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.1em' }}>NO CONTESTS</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '32px', color: 'var(--gold)' }}>
                {record.total}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '12px', letterSpacing: '0.1em' }}>TOTAL FIGHTS</div>
            </div>
          </div>
        )}
      </div>

      {/* Fight History */}
      <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', marginBottom: '16px' }}>
        FIGHT HISTORY
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fights.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>No fight history found.</p>
        ) : (
          fights.map((fight, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  {fight.event_name || 'Unknown Event'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  {fight.event_date || ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700' }}>
                  vs {fight.opponent || 'Unknown'}
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '13px' }}>
                  {fight.method || ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default FighterProfile