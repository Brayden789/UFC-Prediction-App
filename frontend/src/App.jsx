import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Fighters from './pages/Fighters'
import FighterProfile from './pages/FighterProfile'
import Predict from './pages/Predict'

function App() {
  return (
    <BrowserRouter>
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fighters" element={<Fighters />} />
          <Route path="/fighters/:id" element={<FighterProfile />} />
          <Route path="/predict" element={<Predict />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App