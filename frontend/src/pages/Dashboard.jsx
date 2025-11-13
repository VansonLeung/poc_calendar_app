import { useCallback, useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { Button } from '../components/ui/Button.jsx'
import LoadingScreen from '../components/layout/LoadingScreen.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Textarea } from '../components/ui/Textarea.jsx'
import {
  createCalendar,
  createEvent,
  deleteCalendar,
  deleteEvent,
  fetchCalendarEvents,
  fetchCalendars,
  updateCalendar,
  updateEvent,
} from '../services/api.js'
import { useAuth } from '../context/AuthContext.jsx'

const localizer = momentLocalizer(moment)
localizer.startAndEndAreDateOnly = () => false
const DnDCalendar = withDragAndDrop(Calendar)

const normalizeEventDate = (value) => {
  if (!value) return new Date()
  if (value instanceof Date) return value
  return moment.utc(value).toDate()
}

const DashboardPage = () => {
  const { user } = useAuth()
  const [calendars, setCalendars] = useState([])
  const [selectedCalendarId, setSelectedCalendarId] = useState(null)
  const [events, setEvents] = useState([])
  const [viewRange, setViewRange] = useState(() => ({
    start: moment().startOf('week').toDate(),
    end: moment().endOf('week').toDate(),
  }))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isCalendarModalOpen, setCalendarModalOpen] = useState(false)
  const [calendarForm, setCalendarForm] = useState({ id: null, name: '', color: '', description: '' })

  const [isEventModalOpen, setEventModalOpen] = useState(false)
  const [eventForm, setEventForm] = useState({
    id: null,
    title: '',
    start: new Date(),
    end: new Date(),
    description: '',
  })

  const activeCalendar = useMemo(
    () => calendars.find((calendar) => calendar.id === selectedCalendarId) || calendars[0],
    [calendars, selectedCalendarId],
  )
  const activeCalendarId = activeCalendar?.id

  const transformEvents = useCallback(
    (fetchedEvents = []) =>
      fetchedEvents.map((event) => ({
        ...event,
        start: normalizeEventDate(event.start_datetime ?? event.start),
        end: normalizeEventDate(event.end_datetime ?? event.end),
      })),
    [],
  )

  const refreshEvents = useCallback(async () => {
    if (!activeCalendarId || !viewRange.start || !viewRange.end) return

    const { events: fetchedEvents } = await fetchCalendarEvents(activeCalendarId, {
      start_date: viewRange.start.toISOString(),
      end_date: viewRange.end.toISOString(),
    })

    setEvents(transformEvents(fetchedEvents))
  }, [activeCalendarId, transformEvents, viewRange.end, viewRange.start])

  const persistEventTiming = useCallback(
    async (eventId, startDate, endDate) => {
      if (!eventId) return
      await updateEvent(eventId, {
        start_datetime: moment(startDate).toISOString(),
        end_datetime: moment(endDate).toISOString(),
      })
      await refreshEvents()
    },
    [refreshEvents],
  )

  useEffect(() => {
    const loadCalendars = async () => {
      try {
        setLoading(true)
        const { calendars: fetchedCalendars } = await fetchCalendars()
        setCalendars(fetchedCalendars)
        if (fetchedCalendars.length > 0) {
          setSelectedCalendarId((current) => current || fetchedCalendars[0].id)
        }
      } catch (err) {
        setError(err.message || 'Failed to load calendars')
      } finally {
        setLoading(false)
      }
    }

    loadCalendars()
  }, [])

  useEffect(() => {
    refreshEvents().catch((err) => setError(err.message || 'Failed to load events'))
  }, [refreshEvents])

  const handleRangeChange = (range) => {
    const start = Array.isArray(range) ? range[0] : range.start
    const end = Array.isArray(range) ? range[range.length - 1] : range.end
    setViewRange({ start: new Date(start), end: new Date(end) })
  }

  const handleCalendarFormChange = (event) => {
    const { name, value } = event.target
    setCalendarForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEventFormChange = (event) => {
    const { name, value } = event.target
    setEventForm((prev) => ({ ...prev, [name]: value }))
  }

  const alwaysTimed = useCallback(() => false, [])

  const handleCreateCalendar = () => {
    setCalendarForm({ id: null, name: '', color: '#3788d8', description: '' })
    setCalendarModalOpen(true)
  }

  const handleEditCalendar = (calendar) => {
    setCalendarForm({
      id: calendar.id,
      name: calendar.name,
      color: calendar.color,
      description: calendar.description || '',
    })
    setCalendarModalOpen(true)
  }

  const handleSaveCalendar = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      if (calendarForm.id) {
        await updateCalendar(calendarForm.id, {
          name: calendarForm.name,
          color: calendarForm.color,
          description: calendarForm.description,
        })
      } else {
        const response = await createCalendar({
          name: calendarForm.name,
          color: calendarForm.color,
          description: calendarForm.description,
        })
        setSelectedCalendarId(response.calendar.id)
      }

      const { calendars: refreshedCalendars } = await fetchCalendars()
      setCalendars(refreshedCalendars)
      setCalendarModalOpen(false)
    } catch (err) {
      setError(err.message || 'Failed to save calendar')
    }
  }

  const handleDeleteCalendar = async (calendarId) => {
    if (!window.confirm('Delete this calendar? All events will be removed.')) return
    try {
      await deleteCalendar(calendarId)
      const { calendars: refreshedCalendars } = await fetchCalendars()
      setCalendars(refreshedCalendars)
      if (refreshedCalendars.length > 0) {
        setSelectedCalendarId(refreshedCalendars[0].id)
      } else {
        setSelectedCalendarId(null)
        setEvents([])
      }
    } catch (err) {
      setError(err.message || 'Failed to delete calendar')
    }
  }

  const openEventModal = (slotInfo) => {
    setEventForm({
      id: null,
      title: '',
      start: normalizeEventDate(slotInfo.start),
      end: normalizeEventDate(slotInfo.end),
      description: '',
    })
    setEventModalOpen(true)
  }

  const handleSelectEvent = (event) => {
    setEventForm({
      id: event.id,
      title: event.title,
      start: normalizeEventDate(event.start),
      end: normalizeEventDate(event.end),
      description: event.description || '',
    })
    setEventModalOpen(true)
  }

  const handleEventSubmit = async (event) => {
    event.preventDefault()
    if (!activeCalendar) {
      setError('Choose a calendar first')
      return
    }

    setError(null)
    try {
      const payload = {
        calendar_id: activeCalendarId,
        title: eventForm.title,
        start_datetime: moment(eventForm.start).toISOString(),
        end_datetime: moment(eventForm.end).toISOString(),
        description: eventForm.description,
      }

      if (eventForm.id) {
        await updateEvent(eventForm.id, payload)
      } else {
        await createEvent(payload)
      }

      setEventModalOpen(false)
      await refreshEvents()
    } catch (err) {
      setError(err.message || 'Failed to save event')
    }
  }

  const handleDeleteEvent = async () => {
    if (!eventForm.id) return
    setError(null)
    try {
      await deleteEvent(eventForm.id)
      setEventModalOpen(false)
      await refreshEvents()
    } catch (err) {
      setError(err.message || 'Failed to delete event')
    }
  }

  const handleEventDrop = async ({ event: droppedEvent, start, end }) => {
    if (!droppedEvent?.id) return
    setError(null)
    try {
      await persistEventTiming(droppedEvent.id, start, end)
    } catch (err) {
      setError(err.message || 'Failed to move event')
    }
  }

  const handleEventResize = async ({ event: resizedEvent, start, end }) => {
    if (!resizedEvent?.id) return
    setError(null)
    try {
      await persistEventTiming(resizedEvent.id, start, end)
    } catch (err) {
      setError(err.message || 'Failed to resize event')
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading your calendars" />
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hello, {user?.name || 'there'}</h1>
          <p className="text-sm text-slate-500">Manage calendars and events with ease</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateCalendar}>New calendar</Button>
          {activeCalendar && (
            <Button variant="outline" onClick={() => handleEditCalendar(activeCalendar)}>
              Edit calendar
            </Button>
          )}
        </div>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <aside className="flex w-full flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:w-80 lg:flex-shrink-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Your calendars</h2>
          </div>
          <ul className="flex-1 space-y-2 overflow-auto pr-1">
            {calendars.map((calendar) => {
              const isActive = activeCalendar?.id === calendar.id
              return (
                <li key={calendar.id}>
                  <div
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarId(calendar.id)}
                      className="flex-1 text-left"
                    >
                      {calendar.name}
                    </button>
                    {isActive && calendar.owner_id === user?.id && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteCalendar(calendar.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm" style={{height: 0, minHeight: `100%`}}>
          {activeCalendar ? (
            <div className="calendar-shell flex-1 min-h-0">
              <DnDCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                allDayAccessor={alwaysTimed}
                style={{ height: '100%' }}
                selectable
                resizable
                showMultiDayTimes
                onSelectSlot={openEventModal}
                onSelectEvent={handleSelectEvent}
                onRangeChange={handleRangeChange}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-500">
              <p className="text-base font-medium">No calendars yet</p>
              <p className="text-sm">Create your first calendar to start planning events</p>
            </div>
          )}
        </section>
      </div>

      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {calendarForm.id ? 'Edit calendar' : 'New calendar'}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleSaveCalendar}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="calendarName">
                  Name
                </label>
                <Input
                  id="calendarName"
                  name="name"
                  value={calendarForm.name}
                  onChange={handleCalendarFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="calendarColor">
                  Color
                </label>
                <Input
                  id="calendarColor"
                  name="color"
                  type="color"
                  value={calendarForm.color}
                  onChange={handleCalendarFormChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="calendarDescription">
                  Description
                </label>
                <Textarea
                  id="calendarDescription"
                  name="description"
                  value={calendarForm.description}
                  onChange={handleCalendarFormChange}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCalendarModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {eventForm.id ? 'Edit event' : 'New event'}
            </h3>
            <form className="mt-4 space-y-4" onSubmit={handleEventSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="eventTitle">
                  Title
                </label>
                <Input
                  id="eventTitle"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="eventStart">
                  Start
                </label>
                <Input
                  id="eventStart"
                  name="start"
                  type="datetime-local"
                  value={moment(eventForm.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="eventEnd">
                  End
                </label>
                <Input
                  id="eventEnd"
                  name="end"
                  type="datetime-local"
                  value={moment(eventForm.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) =>
                    setEventForm((prev) => ({
                      ...prev,
                      end: new Date(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="eventDescription">
                  Description
                </label>
                <Textarea
                  id="eventDescription"
                  name="description"
                  rows={3}
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                />
              </div>
              <div className="flex justify-between">
                {eventForm.id ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setEventModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
