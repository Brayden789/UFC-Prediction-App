import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/fighters', label: 'Fighters' },
    { path: '/predict', label: 'Predict' },
  ]

  return (
    <nav style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--red)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '28px', color: 'var(--red)', letterSpacing: '0.1em' }}>
            UFC <span style={{ color: 'var(--text)' }}>PREDICT</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '32px' }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                textDecoration: 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                letterSpacing: '0.05em',
                color: location.pathname === link.path ? 'var(--red)' : 'var(--muted)',
                borderBottom: location.pathname === link.path ? '2px solid var(--red)' : '2px solid transparent',
                paddingBottom: '4px',
                transition: 'color 0.2s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>
    </nav>
  )
}

export default Navbar