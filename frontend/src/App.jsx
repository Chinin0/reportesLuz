import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import CreateReportPage from './pages/CreateReportPage'
import AdminPage from './pages/AdminPage'
import './styles/app.css'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    setIsAdmin(!!token)
  }, [])

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          window.dispatchEvent(new CustomEvent('goToLocation', {
            detail: { latitude, longitude, markLocation: true }
          }))
        },
        (error) => {
          console.error('Error de geolocalización:', error)
          alert('No se pudo acceder a tu ubicación')
        }
      )
    } else {
      alert('Tu navegador no soporta geolocalización')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setIsAdmin(false)
  }

  const handleLoginSuccess = () => {
    setIsAdmin(true)
    setShowLoginModal(false)
  }

  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="logo">
              🔦
            </Link>
            <nav className="nav">
              <button onClick={handleMyLocation} className="my-location-btn" title="Mi ubicación actual">
                📍
              </button>
              {isAdmin ? (
                <>
                  <Link to="/admin" className="nav-link">Panel Admin</Link>
                  <button onClick={handleLogout} className="logout-btn">
                    Cerrar
                  </button>
                </>
              ) : (
                <button onClick={() => setShowLoginModal(true)} className="login-btn-small">
                  Admin
                </button>
              )}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<CreateReportPage />} />
          {isAdmin && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {showLoginModal && !isAdmin && (
          <LoginModal onClose={() => setShowLoginModal(false)} onSuccess={handleLoginSuccess} />
        )}
      </div>
    </Router>
  )
}

function NotFound() {
  return (
    <div className="container">
      <h1>Página no encontrada</h1>
      <Link to="/">Volver al inicio</Link>
    </div>
  )
}

function LoginModal({ onClose, onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('adminToken', data.token)
        onSuccess()
      } else {
        setError(data.message || 'Error en login')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Login Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Conectando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
