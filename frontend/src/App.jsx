import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<div style={{ color: 'white', padding: '32px' }}>Home</div>} />
          <Route path="/fighters" element={<div style={{ color: 'white', padding: '32px' }}>Fighters</div>} />
          <Route path="/fighters/:id" element={<div style={{ color: 'white', padding: '32px' }}>Profile</div>} />
          <Route path="/predict" element={<div style={{ color: 'white', padding: '32px' }}>Predict</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App