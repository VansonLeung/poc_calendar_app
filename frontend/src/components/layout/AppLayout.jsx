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
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-[200px]">
            <p className="text-xl font-semibold text-slate-900">Calendar Workspace</p>
            <p className="text-sm text-slate-500">Plan, organize, and keep everyone aligned</p>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
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
      <main className="flex flex-1 flex-col bg-slate-100">
        <div className="flex flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-0 w-full flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default AppLayout
