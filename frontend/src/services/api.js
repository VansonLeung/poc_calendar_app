import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:13331/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken = null

export const setAuthToken = (token) => {
  authToken = token
}

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

const handleResponse = (promise) =>
  promise
    .then((response) => response.data)
    .catch((error) => {
      const message = error.response?.data?.error || error.message || 'Request failed'
      throw new Error(message)
    })

// Authentication
export const login = (credentials) => handleResponse(apiClient.post('/auth/login', credentials))
export const register = (payload) => handleResponse(apiClient.post('/auth/register', payload))
export const getProfile = () => handleResponse(apiClient.get('/auth/profile'))

// Calendars
export const fetchCalendars = () => handleResponse(apiClient.get('/calendars'))
export const createCalendar = (payload) => handleResponse(apiClient.post('/calendars', payload))
export const updateCalendar = (calendarId, payload) =>
  handleResponse(apiClient.put(`/calendars/${calendarId}`, payload))
export const deleteCalendar = (calendarId) => handleResponse(apiClient.delete(`/calendars/${calendarId}`))

// Events
export const fetchCalendarEvents = (calendarId, params = {}) =>
  handleResponse(apiClient.get(`/events/calendar/${calendarId}`, { params }))

export const fetchUserEvents = (params = {}) => handleResponse(apiClient.get('/events', { params }))

export const createEvent = (payload) => handleResponse(apiClient.post('/events', payload))
export const updateEvent = (eventId, payload) => handleResponse(apiClient.put(`/events/${eventId}`, payload))
export const deleteEvent = (eventId) => handleResponse(apiClient.delete(`/events/${eventId}`))

export default apiClient
