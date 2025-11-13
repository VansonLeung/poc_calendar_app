import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  getProfile,
  login as loginRequest,
  register as registerRequest,
  setAuthToken,
} from '../services/api'

const TOKEN_STORAGE_KEY = 'calendar_app_token'

export const AuthContext = createContext(undefined)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const applyToken = useCallback((nextToken) => {
    setToken(nextToken)
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
    setAuthToken(nextToken)
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch (error) {
      console.error('Failed to load profile', error)
      applyToken(null)
      setUser(null)
    }
  }, [applyToken])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      setLoading(false)
      return
    }
    applyToken(storedToken)
    fetchProfile().finally(() => setLoading(false))
  }, [applyToken, fetchProfile])

  const login = useCallback(
    async (credentials) => {
      const response = await loginRequest(credentials)
      applyToken(response.token)
      setUser(response.user)
      return response
    },
    [applyToken],
  )

  const register = useCallback(
    async (payload) => {
      const response = await registerRequest(payload)
      applyToken(response.token)
      setUser(response.user)
      return response
    },
    [applyToken],
  )

  const logout = useCallback(() => {
    applyToken(null)
    setUser(null)
  }, [applyToken])

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshProfile: fetchProfile,
      isAuthenticated: Boolean(token && user),
    }),
    [token, user, loading, login, register, logout, fetchProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
