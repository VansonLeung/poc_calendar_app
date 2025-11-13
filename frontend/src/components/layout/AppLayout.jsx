import { Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const AppLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xl font-semibold text-slate-900">Calendar Workspace</p>
            <p className="text-sm text-slate-500">Plan, organize, and keep everyone aligned</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
