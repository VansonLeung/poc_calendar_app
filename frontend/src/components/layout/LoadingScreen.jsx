import PropTypes from 'prop-types'

const LoadingScreen = ({ message = 'Loading' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center space-y-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" aria-hidden="true" />
  <p className="text-sm font-medium text-slate-600">{message}...</p>
      </div>
    </div>
  )
}

LoadingScreen.propTypes = {
  message: PropTypes.string,
}

export default LoadingScreen
