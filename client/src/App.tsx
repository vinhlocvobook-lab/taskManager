import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/tasks" element={<div>Tasks Page - Coming Soon</div>} />
      <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
    </Routes>
  )
}

export default App