import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<div style={{ padding: '2rem' }}>Tasks Page - Coming Soon</div>} />
        <Route path="/" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App