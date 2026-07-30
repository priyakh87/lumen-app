'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Palette,
  Compass,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Check,
  Mail,
  User,
  Phone,
  MessageSquare,
  Loader2,
  X,
  ExternalLink,
  Pencil,
  RefreshCw,
  Star,
  LayoutDashboard,
  SquarePlay,
} from 'lucide-react'
import { tzShort } from '@/lib/utils'

const iconMap = {
  sparkles: Sparkles,
  palette: Palette,
  compass: Compass,
  cpu: Cpu,
  star: SquarePlay,
  user: User,
  dashboard: LayoutDashboard,
  'layout-dashboard': LayoutDashboard,
  'square-play': SquarePlay,
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[0-9\s().-]{5,20}$/

function isValidEmail(email) {
  return emailRegex.test(String(email || '').trim())
}

function isValidPhone(phone) {
  const value = String(phone || '').trim()
  return value === '' || phoneRegex.test(value)
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10)
}

function humanDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) 
}

function applyTilt(event) {
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  const rect = el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const px = (x / rect.width - 0.5) * 2
  const py = (y / rect.height - 0.5) * 2
  const rotY = px * 10
  const rotX = -py * 10
//   el.style.setProperty('--tilt-x', `${rotX}deg`)
//   el.style.setProperty('--tilt-y', `${rotY}deg`)
//   el.style.setProperty('--tilt-spot', `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`)
}

function resetTilt(event) {
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
//   el.style.setProperty('--tilt-x', '0deg')
//   el.style.setProperty('--tilt-y', '0deg')
//   el.style.setProperty('--tilt-spot', '50% 20%')
}

const tiltHandlers = { onPointerMove: applyTilt, onPointerLeave: resetTilt }

function Calendar({ selectedDate, onSelect }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const today = new Date(); today.setHours(0,0,0,0)
  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
    const startDay = first.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < startDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    return cells
  }, [cursor])
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="glass-subtle rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="w-8 h-8 rounded-lg glass hover:scale-105 transition flex items-center justify-center"><ChevronLeft className="w-4 h-4 text-fg" /></button>
        <div className="text-fg font-medium">{monthLabel}</div>
        <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="w-8 h-8 rounded-lg glass hover:scale-105 transition flex items-center justify-center"><ChevronRight className="w-4 h-4 text-fg" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-fg-subtle mb-1">
        {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="text-center py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />
          const iso = fmtDate(d)
          const isPast = d < today
          const isSelected = selectedDate === iso
          const isToday = iso === fmtDate(today)
          return (
            <button key={i} disabled={isPast} onClick={() => onSelect(iso)}
              className={`aspect-square rounded-lg text-sm transition relative ${isPast ? 'text-fg-subtle opacity-40 cursor-not-allowed' : 'text-fg hover:bg-black/5 dark:hover:bg-white/10'} ${isSelected ? 'bg-accent-grad text-white shadow-lg' : ''}`}>
              {d.getDate()}
              {isToday && !isSelected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Stepper({ step }) {
  const steps = ['Service', 'Date & Time', 'Details', 'Confirm']
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition ${i <= step ? 'bg-accent-grad text-white shadow' : 'glass text-fg-subtle'}`}>
            {i < step ? <Check className="w-3.5 h-3.5"/> : i + 1}
          </div>
          <div className={`text-xs whitespace-nowrap ${i <= step ? 'text-fg' : 'text-fg-subtle'}`}>{s}</div>
          {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-accent-grad' : 'bg-black/10 dark:bg-white/10'}`} />}
        </div>
      ))}
    </div>
  )
}

function BookingCard({ b, onCancel, onEdit, showActions }) {
  const isCancelled = b.status === 'cancelled'
  const tz = tzShort(b.timeZone)
  return (
    <div className={`glass rounded-2xl p-4 ${isCancelled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-accent-grad flex flex-col items-center justify-center text-white shrink-0">
            <div className="text-[10px] uppercase tracking-wide leading-none opacity-90">{new Date(b.date + 'T00:00').toLocaleDateString(undefined, { month: 'short' })}</div>
            <div className="text-lg font-bold leading-none mt-0.5">{new Date(b.date + 'T00:00').getDate()}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-fg font-medium truncate">{b.serviceName}</div>
            <div className="text-xs text-fg-muted mt-0.5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3"/> {b.time}{tz && <span className="text-fg-subtle"> {tz}</span>} · {b.duration}m</span>
              {b.gcalSynced && (
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CalendarIcon className="w-3 h-3"/> Synced to Google</span>
              )}
              {!b.gcalSynced && b.gcalEventId && showActions && (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><RefreshCw className="w-3 h-3"/> Needs re-sync</span>
              )}
            </div>
            {b.notes && <div className="text-xs text-fg-muted mt-2 border-t border-glass pt-2">{b.notes}</div>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {isCancelled ? (
            <span className="text-[10px] text-rose-600 dark:text-rose-300 bg-rose-500/10 px-2 py-1 rounded-lg">CANCELLED</span>
          ) : showActions ? (
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(b)} title="Edit / reschedule" className="text-xs text-fg-muted hover:text-fg transition glass rounded-lg p-1.5"><Pencil className="w-3 h-3" /></button>
              <button onClick={() => onCancel(b.id)} className="text-xs text-fg-muted hover:text-rose-500 transition glass rounded-lg px-2 py-1">Cancel</button>
            </div>
          ) : (
            <span className="text-[10px] text-fg-subtle bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">COMPLETED</span>
          )}
          {b.gcalEventLink && (
            <a href={b.gcalEventLink} target="_blank" rel="noreferrer" className="text-[10px] text-fg-muted hover:text-fg inline-flex items-center gap-0.5">open <ExternalLink className="w-2.5 h-2.5" /></a>
          )}
        </div>
      </div>
    </div>
  )
}

function EditBookingModal({ booking, onClose, onSaved }) {
  const [date, setDate] = useState(booking?.date || '')
  const [time, setTime] = useState(booking?.time || '')
  const [notes, setNotes] = useState(booking?.notes || '')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    fetch(`/api/availability?date=${date}&serviceId=${booking.serviceId}`)
      .then(r => r.json()).then(d => setSlots(d.slots || []))
      .finally(() => setLoadingSlots(false))
  }, [date, booking?.serviceId])

  async function save() {
    setSaving(true); setError('')
    try {
      const access = typeof window !== 'undefined' ? window.localStorage.getItem('bookingAccess') : ''
      const res = await fetch(`/api/bookings/${booking.id}?access=${encodeURIComponent(access || '')}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, time, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      onSaved(data)
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  if (!booking) return null

  const changed = date !== booking.date || time !== booking.time || notes !== (booking.notes || '')

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl max-w-2xl w-full p-6 md:p-7 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-fg-subtle">Reschedule</div>
            <h3 className="text-2xl font-semibold text-fg tracking-tight">{booking.serviceName}</h3>
            <div className="text-xs text-fg-muted mt-1">Currently: {humanDate(booking.date)} · {booking.time} {tzShort(booking.timeZone)}</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl glass hover:scale-105 transition flex items-center justify-center"><X className="w-4 h-4 text-fg"/></button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <Calendar selectedDate={date} onSelect={(d) => { setDate(d); if (d !== booking.date) setTime('') }} />
          <div className="glass-subtle rounded-2xl p-4">
            <div className="text-fg font-medium text-sm mb-3">{date ? humanDate(date) : 'Pick a date'}</div>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-10 text-fg-muted"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading times</div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                {slots.map((s) => {
                  const isCurrent = date === booking.date && s.time === booking.time
                  const usable = s.available || isCurrent
                  return (
                    <button key={s.time} disabled={!usable} onClick={() => setTime(s.time)}
                      className={`rounded-xl px-3 py-2 text-sm transition ${!usable ? 'text-fg-subtle line-through cursor-not-allowed opacity-40' : time === s.time ? 'bg-accent-grad text-white shadow-lg' : 'glass hover:scale-[1.02] text-fg'}`}>
                      {s.time}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <label className="block mt-4">
          <div className="text-xs text-fg-muted mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Notes</div>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="glass-input w-full rounded-xl px-4 py-3 resize-none" placeholder="Anything we should know?" />
        </label>

        {booking.gcalSynced && (
          <div className="mt-3 text-xs text-fg-muted glass-subtle rounded-xl px-3 py-2 flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5 text-emerald-500" /> Your Google Calendar event will update automatically when you save.</div>
        )}
        {error && <div className="mt-3 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-4 py-2">{error}</div>}

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="glass rounded-xl px-4 py-2 text-sm text-fg hover:scale-[1.02] transition">Cancel</button>
          <button onClick={save} disabled={!changed || !date || !time || saving} className={`rounded-xl px-5 py-2 text-sm inline-flex items-center gap-2 transition ${changed && date && time && !saving ? 'bg-accent-grad text-white shadow-lg hover:scale-[1.02]' : 'glass text-fg-subtle opacity-60 cursor-not-allowed'}`}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving…</> : <>Save changes <Check className="w-4 h-4"/></>}
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingsModal({ open, onClose, initialEmail }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [tab, setTab] = useState('upcoming')
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState('')

  async function fetchBookings(e) {
    if (e) e.preventDefault()
    if (!email) return
    setLoading(true); setSearched(true)
    const access = typeof window !== 'undefined' ? window.localStorage.getItem('bookingAccess') : ''
    const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}&access=${encodeURIComponent(access || '')}`)
    const data = await res.json()
    setBookings(data.bookings || [])
    setLoading(false)
  }

  useEffect(() => {
    if (open && initialEmail) { setEmail(initialEmail); setTimeout(() => fetchBookings(), 50) }
  }, [open, initialEmail])

  async function cancel(id) {
    const access = typeof window !== 'undefined' ? window.localStorage.getItem('bookingAccess') : ''
    await fetch(`/api/bookings/${id}?access=${encodeURIComponent(access || '')}`, { method: 'DELETE' })
    fetchBookings()
  }

  const { upcoming, past } = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0)
    const up = []
    const ps = []
    for (const b of bookings) {
      const d = new Date(b.date + 'T' + (b.time || '00:00'))
      if (b.status !== 'cancelled' && d >= now) up.push(b)
      else ps.push(b)
    }
    up.sort((a,b) => (a.date+a.time).localeCompare(b.date+b.time))
    ps.sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time))
    return { upcoming: up, past: ps }
  }, [bookings])

  if (!open) return null
  const list = tab === 'upcoming' ? upcoming : past

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl max-w-lg w-full p-6 md:p-7">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-fg-subtle">Your appointments</div>
            <h3 className="text-2xl font-semibold text-fg tracking-tight">My bookings</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl glass hover:scale-105 transition flex items-center justify-center"><X className="w-4 h-4 text-fg"/></button>
        </div>
        <form onSubmit={fetchBookings} className="flex gap-2">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="glass-input flex-1 rounded-xl px-4 py-2.5" />
          <button className="glass rounded-xl px-4 py-2.5 text-sm text-fg hover:scale-[1.02] transition">Look up</button>
        </form>

        {searched && (
          <div className="mt-4 glass-subtle rounded-xl p-1 flex">
            {[{k:'upcoming',l:`Upcoming (${upcoming.length})`},{k:'past',l:`Past (${past.length})`}].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)} className={`flex-1 text-xs font-medium rounded-lg py-2 transition ${tab===t.k ? 'bg-accent-grad text-white shadow' : 'text-fg-muted hover:text-fg'}`}>{t.l}</button>
            ))}
          </div>
        )}

        <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
          {loading && <div className="flex items-center justify-center py-8 text-fg-muted"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading</div>}
          {!loading && searched && list.length === 0 && (
            <div className="text-center text-fg-subtle py-8 text-sm">{tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments.'}</div>
          )}
          {list.map(b => <BookingCard key={b.id} b={b} onCancel={cancel} onEdit={(x) => setEditing(x)} showActions={tab === 'upcoming'} />)}
        </div>
      </div>
      {editing && (
        <EditBookingModal booking={editing} onClose={() => setEditing(null)} onSaved={(data) => {
          setEditing(null)
          fetchBookings()
          if (data?.gcalUpdate?.ok) setToast('Booking updated & Google Calendar synced.')
          else if (data?.booking?.gcalEventId && !data?.booking?.gcalSynced) setToast('Booking updated — please re-sync to Google Calendar.')
          else setToast('Booking updated.')
          setTimeout(() => setToast(''), 4000)
        }} />
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] glass-strong rounded-2xl px-4 py-3 shadow-2xl text-sm text-fg flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500"/> {toast}</div>
      )}
    </div>
  )
}

function BookingFlow({ services, initialService, onDone }) {
  const [step, setStep] = useState(initialService ? 1 : 0)
  const [service, setService] = useState(initialService || null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialService) { setService(initialService); setStep(1) }
  }, [initialService])

  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    fetch(`/api/availability?date=${date}&serviceId=${service?.id || ''}`)
      .then(r => r.json()).then(d => setSlots(d.slots || []))
      .finally(() => setLoadingSlots(false))
  }, [date, service])

  const isEmailValid = isValidEmail(form.email)
  const isPhoneValid = isValidPhone(form.phone)
  const canNext = (
    (step === 0 && service) ||
    (step === 1 && date && time) ||
    (step === 2 && form.name && form.email && isEmailValid && isPhoneValid)
  )

  async function submit() {
    setSubmitting(true); setError('')
    try {
      if (!isEmailValid) {
        throw new Error('Enter a valid email address')
      }
      if (!isPhoneValid) {
        throw new Error('Enter a valid phone number')
      }
      const res = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id, date, time, ...form,
          timeZone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed')
      if (typeof window !== 'undefined') {
        const accessValue = data.booking?.access || ''
        if (accessValue) window.localStorage.setItem('bookingAccess', accessValue)
      }
      setResult(data.booking)
      setStep(3)
      onDone?.(data.booking?.email)
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }

  return (
    <section id="book" className="px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <div {...tiltHandlers} className="glass-strong tilt-surface rounded-3xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm text-fg-subtle">Book your appointment</div>
                <h2 className="text-2xl md:text-3xl font-semibold text-fg tracking-tight">Just a few taps.</h2>
              </div>
              {service && step < 3 && (
                <div className="glass rounded-xl px-3 py-2 text-xs text-fg-muted hidden sm:flex items-center gap-2">
                  <span className="font-medium text-fg">{service.name}</span>
                  <span>· {service.duration}m</span>
                </div>
              )}
            </div>
            <Stepper step={step} />

            <div key={step}>
              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {services.map(s => {
                    const Icon = iconMap[s.icon] || Sparkles
                    const active = service?.id === s.id
                    return (
                      <button key={s.id} onClick={() => setService(s)} className={`text-left rounded-2xl p-4 transition ${active ? 'glass-strong ring-accent' : 'glass hover:scale-[1.01]'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-fg font-medium">{s.name}</div>
                            <div className="text-xs text-fg-muted mt-0.5">{s.duration}m · {s.price ? `$${s.price}` : 'Free'}</div>
                          </div>
                          {active && <Check className="w-5 h-5 text-teal-500" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Calendar selectedDate={date} onSelect={(d) => { setDate(d); setTime('') }} />
                  <div className="glass-subtle rounded-2xl p-4">
                    <div className="text-fg font-medium text-sm mb-3">{date ? humanDate(date) : 'Pick a date to see times'}</div>
                    {loadingSlots ? (
                      <div className="flex items-center justify-center py-10 text-fg-muted"><Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading times</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                        {slots.map((s) => (
                          <button key={s.time} disabled={!s.available} onClick={() => setTime(s.time)} className={`rounded-xl px-3 py-2 text-sm transition ${!s.available ? 'text-fg-subtle line-through cursor-not-allowed opacity-40' : time === s.time ? 'bg-accent-grad text-white shadow-lg' : 'glass hover:scale-[1.02] text-fg'}`}>
                            {s.time}
                          </button>
                        ))}
                        {!date && <div className="col-span-3 text-fg-subtle text-sm py-6 text-center">Select a date first</div>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label>
                    <div className="text-xs text-fg-muted mb-1 flex items-center gap-1"><User className="w-3 h-3"/> Full name</div>
                    <input className="glass-input w-full rounded-xl px-4 py-3" placeholder="Ada Lovelace" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </label>
                  <label>
                    <div className="text-xs text-fg-muted mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> Email</div>
                    <input type="email" className="glass-input w-full rounded-xl px-4 py-3" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    {!isEmailValid && form.email && <p className="text-rose-500 text-xs mt-2">Enter a valid email address.</p>}
                  </label>
                  <label>
                    <div className="text-xs text-fg-muted mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone (optional)</div>
                    <input className="glass-input w-full rounded-xl px-4 py-3" placeholder="+1 555 123 4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    {form.phone && !isPhoneValid && <p className="text-rose-500 text-xs mt-2">Enter a valid phone number.</p>}
                  </label>
                  <label className="sm:col-span-2">
                    <div className="text-xs text-fg-muted mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> Notes (optional)</div>
                    <textarea rows={3} className="glass-input w-full rounded-xl px-4 py-3 resize-none" placeholder="Anything we should know?" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </label>
                </div>
              )}

              {step === 3 && result && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-accent-grad mx-auto flex items-center justify-center mb-4 shadow-xl">
                    <Check className="w-8 h-8 text-white"/>
                  </div>
                  <h3 className="text-2xl font-semibold text-fg">You’re booked.</h3>
                  <p className="text-fg-muted mt-2">A confirmation is on its way to <span className="text-fg font-medium">{result.email}</span>.</p>
                  <div className="mt-6 glass rounded-2xl p-5 text-left inline-block min-w-[300px]">
                    <div className="flex items-center justify-between text-sm text-fg-muted"><span>Service</span><span className="text-fg">{result.serviceName}</span></div>
                    <div className="flex items-center justify-between text-sm text-fg-muted mt-2"><span>When</span><span className="text-fg">{humanDate(result.date)} · {result.time}</span></div>
                    <div className="flex items-center justify-between text-sm text-fg-muted mt-2"><span>Duration</span><span className="text-fg">{result.duration} min</span></div>
                    <div className="flex items-center justify-between text-sm text-fg-muted mt-2"><span>Reference</span><span className="text-fg font-mono text-xs">{result.id.slice(0,8)}</span></div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <a href={`/api/gcal/start?bookingId=${result.id}`} className="glass-strong rounded-xl px-4 py-2 text-sm text-fg hover:scale-[1.02] transition inline-flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Add to Google Calendar</a>
                    <button onClick={() => { setStep(0); setService(null); setDate(''); setTime(''); setForm({ name: '', email: '', phone: '', notes: '' }); setResult(null) }} className="glass rounded-xl px-4 py-2 text-sm text-fg hover:scale-[1.02] transition">Book another</button>
                    <button onClick={() => onDone && onDone(result.email)} className="glass rounded-xl px-4 py-2 text-sm text-fg hover:scale-[1.02] transition">View my bookings</button>
                  </div>
                </div>
              )}

              {error && <div className="mt-4 text-sm text-rose-600 dark:text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-4 py-2">{error}</div>}

              {step < 3 && (
                <div className="mt-6 flex items-center justify-between">
                  <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className={`text-sm inline-flex items-center gap-1 ${step === 0 ? 'text-fg-subtle opacity-40 cursor-not-allowed' : 'text-fg-muted hover:text-fg'}`}>
                    <ChevronLeft className="w-4 h-4"/> Back
                  </button>
                  {step < 2 ? (
                    <button onClick={() => setStep(step + 1)} disabled={!canNext} className={`rounded-xl px-5 py-2.5 text-sm inline-flex items-center gap-1 transition ${canNext ? 'glass-strong text-fg hover:scale-[1.02]' : 'glass text-fg-subtle opacity-60 cursor-not-allowed'}`}>
                      Continue <ChevronRight className="w-4 h-4"/>
                    </button>
                  ) : (
                    <button onClick={submit} disabled={!canNext || submitting} className={`rounded-xl shimmer-button px-5 py-2.5 text-sm inline-flex items-center gap-2 transition ${canNext && !submitting ? 'bg-accent-grad text-white shadow-lg hover:scale-[1.02]' : 'glass text-fg-subtle opacity-60 cursor-not-allowed'}`}>
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin"/> Booking…</> : <>Confirm booking <Check className="w-4 h-4"/></>}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function BookingSection({ services, initialService, onDone, open, onClose, initialEmail }) {
  return (
    <>
      <BookingFlow services={services} initialService={initialService} onDone={onDone} />
      <BookingsModal open={open} onClose={onClose} initialEmail={initialEmail} />
    </>
  )
}
