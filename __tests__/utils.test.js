import {
  timeToMinutes,
  addMinutesToTime,
  computeSlot,
  generateSlots,
  tzShort,
  splitBookings,
} from '@/lib/utils'

describe('lib/utils — time helpers', () => {
  test('timeToMinutes converts HH:MM to minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0)
    expect(timeToMinutes('09:30')).toBe(570)
    expect(timeToMinutes('23:45')).toBe(23 * 60 + 45)
  })

  test('addMinutesToTime handles basic addition', () => {
    expect(addMinutesToTime('09:00', 30)).toBe('09:30')
    expect(addMinutesToTime('09:45', 30)).toBe('10:15')
    expect(addMinutesToTime('10:00', 90)).toBe('11:30')
  })

  test('addMinutesToTime wraps past midnight cleanly', () => {
    expect(addMinutesToTime('23:30', 60)).toBe('00:30')
    expect(addMinutesToTime('23:59', 1)).toBe('00:00')
  })

  test('computeSlot returns naive local ISO strings paired with duration', () => {
    expect(computeSlot('2026-07-16', '15:30', 30)).toEqual({
      startLocal: '2026-07-16T15:30:00',
      endLocal: '2026-07-16T16:00:00',
    })
    expect(computeSlot('2026-07-16', '09:00', 90)).toEqual({
      startLocal: '2026-07-16T09:00:00',
      endLocal: '2026-07-16T10:30:00',
    })
  })

  test('generateSlots produces 18 half-hour slots between 09:00 and 18:00', () => {
    const slots = generateSlots()
    expect(slots).toHaveLength(18)
    expect(slots[0]).toBe('09:00')
    expect(slots[1]).toBe('09:30')
    expect(slots.at(-1)).toBe('17:30')
    // No duplicates
    expect(new Set(slots).size).toBe(slots.length)
  })
})

describe('lib/utils — tzShort', () => {
  test('returns empty string when no timezone provided', () => {
    expect(tzShort('')).toBe('')
    expect(tzShort(null)).toBe('')
    expect(tzShort(undefined)).toBe('')
  })

  test('returns a non-empty short label for a valid IANA timezone', () => {
    // We can't assert an exact string because the short name depends on the
    // current date (EDT vs EST, IST vs IST, etc.) — just assert it's a
    // short alphanumeric label.
    const label = tzShort('America/New_York')
    expect(label).toMatch(/^[A-Z0-9+\-:]+$/)
    expect(label.length).toBeGreaterThan(0)
  })

  test('returns empty string for an invalid timezone', () => {
    expect(tzShort('Not/A_Real_Zone')).toBe('')
  })
})

describe('lib/utils — splitBookings', () => {
  const NOW = new Date('2026-07-16T10:00:00')

  const bookings = [
    { id: 'a', date: '2026-07-20', time: '10:00', status: 'confirmed' },  // upcoming
    { id: 'b', date: '2026-07-15', time: '09:00', status: 'confirmed' },  // past
    { id: 'c', date: '2026-08-01', time: '14:00', status: 'cancelled' }, // cancelled -> past
    { id: 'd', date: '2026-07-16', time: '15:00', status: 'confirmed' },  // today upcoming
    { id: 'e', date: '2026-07-17', time: '11:00', status: 'confirmed' },  // upcoming
  ]

  test('groups bookings into upcoming and past based on date + status', () => {
    const { upcoming, past } = splitBookings(bookings, NOW)
    expect(upcoming.map((b) => b.id)).toEqual(['d', 'e', 'a'])
    expect(past.map((b) => b.id)).toEqual(['c', 'b'])
  })

  test('handles empty and undefined inputs', () => {
    expect(splitBookings([], NOW)).toEqual({ upcoming: [], past: [] })
    expect(splitBookings(undefined, NOW)).toEqual({ upcoming: [], past: [] })
  })

  test('cancelled bookings always land in past, even if future-dated', () => {
    const { upcoming, past } = splitBookings(
      [{ id: 'x', date: '2099-01-01', time: '10:00', status: 'cancelled' }],
      NOW,
    )
    expect(upcoming).toHaveLength(0)
    expect(past).toHaveLength(1)
  })
})
