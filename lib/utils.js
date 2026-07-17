import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// ===== Lumen appointment helpers =====

/** "HH:MM" -> minutes since midnight */
export function timeToMinutes(time) {
  const [h, m] = String(time).split(':').map(Number)
  return h * 60 + m
}

/** Add N minutes to a "HH:MM" string, returning a new "HH:MM" string (wrap at 24h). */
export function addMinutesToTime(time, minutes) {
  const total = timeToMinutes(time) + Number(minutes)
  const nh = ((Math.floor(total / 60) % 24) + 24) % 24
  const nm = ((total % 60) + 60) % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

/** date + start time + duration -> naive local datetime strings for Google Calendar API. */
export function computeSlot(date, time, durationMin) {
  const endTime = addMinutesToTime(time, durationMin)
  return {
    startLocal: `${date}T${time}:00`,
    endLocal: `${date}T${endTime}:00`,
  }
}

/** All 30-min booking slots between 09:00 and 18:00 for a business day. */
export function generateSlots() {
  const slots = []
  for (let h = 9; h < 18; h++) {
    for (const m of [0, 30]) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}

/** Convert an IANA timezone (e.g. "America/New_York") to a short label (e.g. "EDT"). */
export function tzShort(tz) {
  if (!tz) return ''
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    }).formatToParts(new Date())
    const p = parts.find((x) => x.type === 'timeZoneName')
    return p ? p.value : ''
  } catch {
    return ''
  }
}

/** Split bookings into upcoming/past relative to a reference date (defaults to now). */
export function splitBookings(bookings, now = new Date()) {
  const boundary = new Date(now)
  boundary.setHours(0, 0, 0, 0)
  const upcoming = []
  const past = []
  for (const b of bookings || []) {
    const d = new Date(`${b.date}T${b.time || '00:00'}`)
    if (b.status !== 'cancelled' && d >= boundary) upcoming.push(b)
    else past.push(b)
  }
  upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  past.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
  return { upcoming, past }
}
