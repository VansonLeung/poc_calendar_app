import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
