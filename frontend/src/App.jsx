import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AuthLayout from './components/layout/AuthLayout.jsx'
import AppLayout from './components/layout/AppLayout.jsx'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import { useAuth } from './context/AuthContext.jsx'
import 'react-big-calendar/lib/css/react-big-calendar.css'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App