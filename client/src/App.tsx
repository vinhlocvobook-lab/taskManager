import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import TasksList from './pages/tasks/TasksList'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TasksList />} />
          <Route path="team" element={<div style={{ padding: '1rem' }}>👥 Team Management - Coming Soon</div>} />
          <Route path="settings" element={<div style={{ padding: '1rem' }}>⚙️ Settings - Coming Soon</div>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
