import { Link, useLocation } from 'react-router-dom'
import ufcLogo from '../assets/ufc-logo.png'

function Navbar() {
  const location = useLocation()
//Creates top links
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/fighters', label: 'Fighters' },
    { path: '/predict', label: 'Predict' },
  ]
//creastes the navbar with the links and styles with ufc predict on the left and the links on the right
  return (
    <nav style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--red)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '64px', height: '64px' }}>
        
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={ufcLogo} alt="UFC" style={{ height: '36px' }} />
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '24px', color: 'var(--text)', letterSpacing: '0.1em' }}>
            PREDICT
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
                //makes it red if its the page we are on and greay if its not
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