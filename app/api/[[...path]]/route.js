import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import { computeSlot, generateSlots } from '@/lib/utils'
import { createBookingAccessValue, verifyBookingAccessValue } from '@/lib/bookingAccess'

export const runtime = 'nodejs'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'appointment_app'
const BOOKING_ACCESS_SECRET = process.env.BOOKING_ACCESS_SECRET || process.env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString('hex')

let cachedClient = null
async function getDb() {
  if (!cachedClient) {
    if (!MONGO_URL) throw new Error('Missing MONGO_URL. Add your MongoDB connection string to the deployment environment variables.')
    cachedClient = new MongoClient(MONGO_URL)
    await cachedClient.connect()
  }
  return cachedClient.db(DB_NAME)
}

function getBaseUrl(request) {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || '').replace(/\/$/, '')
  if (configuredBaseUrl) return configuredBaseUrl

  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  if (host) return `${forwardedProto}://${host}`
  return 'http://localhost:3000'
}

function getGoogleRedirectUri(request) {
  return `${getBaseUrl(request)}/api/gcal/callback`
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isValidPhone(phone) {
  if (!phone) return true
  const normalized = String(phone).trim()
  return /^[+]?[(]?[0-9]{1,4}[)]?[0-9\s().-]{5,20}$/.test(normalized)
}

const DEFAULT_SERVICES = [
  { id: 'srv-consult', name: 'Strategy Consultationnnn', duration: 30, price: 0, description: 'A focused 30-minute session to align on goals and next steps.', icon: 'sparkles', color: 'from-emerald-400 to-teal-400' },
  { id: 'srv-design', name: 'Design Review', duration: 45, price: 0, description: 'Deep review of your product design with actionable recommendations.', icon: 'palette', color: 'from-teal-400 to-sky-400' },
  { id: 'srv-coaching', name: 'Executive Coaching', duration: 60, price:0, description: 'Personalized coaching to unlock leadership potential and clarity.', icon: 'compass', color: 'from-sky-400 to-indigo-400' },
  { id: 'srv-tech', name: 'Tech Deep Dive', duration: 90, price: 0, description: 'Architecture, scaling and AI integration deep dive with an expert.', icon: 'cpu', color: 'from-emerald-400 to-sky-400' },
]

async function ensureSeed(db) {
  const count = await db.collection('services').countDocuments()
  if (count === 0) await db.collection('services').insertMany(DEFAULT_SERVICES)
  // Force refresh colors to new palette if needed
  await db.collection('services').bulkWrite(
    DEFAULT_SERVICES.map(s => ({ updateOne: { filter: { id: s.id }, update: { $set: { color: s.color } } } }))
  )
}

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

function getBookingAccessContext(request) {
  const url = new URL(request.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const accessValue = url.searchParams.get('access') || ''
  const hasValidAccess = verifyBookingAccessValue(accessValue, email, BOOKING_ACCESS_SECRET)

  return {
    email,
    accessValue,
    hasValidAccess,
  }
}

function oauthAuthUrl(state, redirectUri) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    access_type: 'offline',
    prompt: 'consent',
    state,
    include_granted_scopes: 'true',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

async function exchangeCodeForTokens(code, redirectUri) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${t}`)
  }
  return res.json()
}

async function insertCalendarEvent(accessToken, event) {
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Event insert failed: ${res.status} ${t}`)
  }
  return res.json()
}

async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Refresh failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function patchCalendarEvent(accessToken, eventId, patch) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error(`Event patch failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function handler(request, ctx) {
  const params = ctx?.params ? await ctx.params : {}
  const rawPath = params?.path
  const pathSegments = Array.isArray(rawPath)
    ? rawPath
    : (typeof rawPath === 'string' && rawPath ? rawPath.split('/').filter(Boolean) : [])
  const route = '/' + pathSegments.join('/')
  const method = request.method

  try {
    if (!MONGO_URL) {
      if (route === '/services' && method === 'GET') {
        return json({ services: DEFAULT_SERVICES })
      }
      return json({ error: 'Database is not configured. Add MONGO_URL to the deployment environment variables.' }, 500)
    }

    const db = await getDb()
    await ensureSeed(db)

    if (route === '/services' && method === 'GET') {
      const services = await db.collection('services').find({}, { projection: { _id: 0 } }).toArray()
      return json({ services })
    }

    if (route === '/availability' && method === 'GET') {
      const url = new URL(request.url)
      const date = url.searchParams.get('date')
      const serviceId = url.searchParams.get('serviceId')
      if (!date) return json({ error: 'date required' }, 400)
      const allSlots = generateSlots()
      const query = { date, status: { $ne: 'cancelled' } }
      if (serviceId) query.serviceId = serviceId
      const bookings = await db.collection('bookings').find(query).toArray()
      const booked = new Set(bookings.map(b => b.time))
      const available = allSlots.map(t => ({ time: t, available: !booked.has(t) }))
      return json({ date, serviceId, slots: available })
    }

    if (route === '/bookings' && method === 'POST') {
      const body = await request.json()
      const { serviceId, date, time, name, email, phone, notes, timeZone } = body
      if (!serviceId || !date || !time || !name || !email) return json({ error: 'Missing required fields' }, 400)
      if (!isValidEmail(email)) return json({ error: 'Invalid email address' }, 400)
      if (!isValidPhone(phone)) return json({ error: 'Invalid phone number' }, 400)

      const service = await db.collection('services').findOne({ id: serviceId }, { projection: { _id: 0 } })
      if (!service) return json({ error: 'Invalid service' }, 400)

      // Layer 1: Same service + same slot → slot was taken
      const serviceConflict = await db.collection('bookings').findOne({ date, time, serviceId, status: { $ne: 'cancelled' } })
      if (serviceConflict) return json({ error: 'That time slot was just taken. Please pick another.' }, 409)

      // Layer 2: Same email + same date+time → personal double-booking
      const normalizedEmail = (email || '').toLowerCase().trim()
      const emailConflict = await db.collection('bookings').findOne({ date, time, email: normalizedEmail, status: { $ne: 'cancelled' } })
      if (emailConflict) return json({ error: `You already have a booking at ${time} on ${date}. Please choose a different time.` }, 409)

      const { startLocal, endLocal } = computeSlot(date, time, service.duration)
      const booking = {
        id: uuidv4(), serviceId, serviceName: service.name, duration: service.duration, price: service.price,
        date, time, name, email: (email || '').toLowerCase().trim(), phone: phone || '', notes: notes || '',
        timeZone: timeZone || 'UTC',
        startLocal, endLocal,
        status: 'confirmed', createdAt: new Date().toISOString(),
        gcalSynced: false, gcalEventId: null, gcalEventLink: null,
      }
      await db.collection('bookings').insertOne(booking)
      const { _id, ...clean } = booking
      const bookingAccess = createBookingAccessValue(clean.email, BOOKING_ACCESS_SECRET)
      return json({ booking: { ...clean, access: bookingAccess } })
    }

    if (route === '/bookings' && method === 'GET') {
      const { email, hasValidAccess } = getBookingAccessContext(request)
      if (!email || !hasValidAccess) {
        return json({ error: 'Access denied' }, 403)
      }

      const bookings = await db.collection('bookings')
        .find({ email }, { projection: { _id: 0, gcalRefreshToken: 0 } })
        .sort({ date: 1, time: 1 })
        .toArray()
      return json({ bookings })
    }

    if (route.startsWith('/bookings/') && method === 'PATCH') {
      const id = route.split('/')[2]
      const body = await request.json()
      const booking = await db.collection('bookings').findOne({ id })
      if (!booking) return json({ error: 'Booking not found' }, 404)

      const { email, hasValidAccess } = getBookingAccessContext(request)
      if (!email || !hasValidAccess || booking.email !== email) {
        return json({ error: 'Access denied' }, 403)
      }

      const newDate = body.date || booking.date
      const newTime = body.time || booking.time
      const newNotes = body.notes !== undefined ? body.notes : booking.notes

      // Conflict check when rescheduling
      if (newDate !== booking.date || newTime !== booking.time) {
        // Layer 1: Same service + same slot → slot taken
        const serviceClash = await db.collection('bookings').findOne({
          date: newDate, time: newTime, serviceId: booking.serviceId,
          status: { $ne: 'cancelled' }, id: { $ne: id },
        })
        if (serviceClash) return json({ error: 'That time slot is already taken. Pick another.' }, 409)

        // Layer 2: Same email + same date+time → personal double-booking
        const emailClash = await db.collection('bookings').findOne({
          date: newDate, time: newTime, email: booking.email,
          status: { $ne: 'cancelled' }, id: { $ne: id },
        })
        if (emailClash) return json({ error: 'You already have a booking at that time. Pick another.' }, 409)
      }

      const { startLocal, endLocal } = computeSlot(newDate, newTime, booking.duration)
      const update = {
        date: newDate, time: newTime, notes: newNotes,
        startLocal, endLocal,
        updatedAt: new Date().toISOString(),
      }

      // Sync change to Google Calendar if this booking was synced
      let gcalUpdate = { ok: false, reason: 'not_synced' }
      if (booking.gcalSynced && booking.gcalEventId && booking.gcalRefreshToken) {
        try {
          const t = await refreshAccessToken(booking.gcalRefreshToken)
          await patchCalendarEvent(t.access_token, booking.gcalEventId, {
            start: { dateTime: startLocal, timeZone: booking.timeZone || 'UTC' },
            end: { dateTime: endLocal, timeZone: booking.timeZone || 'UTC' },
            description: `Lumen appointment\n\nBooking ID: ${booking.id}${newNotes ? '\n\nNotes: ' + newNotes : ''}`,
          })
          gcalUpdate = { ok: true }
        } catch (e) {
          console.error('gcal patch failed', e)
          gcalUpdate = { ok: false, reason: e.message }
          // Mark as out-of-sync so user can re-sync
          update.gcalSynced = false
        }
      } else if (booking.gcalSynced && (!booking.gcalRefreshToken || !booking.gcalEventId)) {
        gcalUpdate = { ok: false, reason: 'missing_refresh_token' }
        update.gcalSynced = false
      }

      await db.collection('bookings').updateOne({ id }, { $set: update })
      const updated = await db.collection('bookings').findOne({ id }, { projection: { _id: 0, gcalRefreshToken: 0 } })
      return json({ booking: updated, gcalUpdate })
    }

    if (route.startsWith('/bookings/') && method === 'DELETE') {
      const id = route.split('/')[2]
      const { email, hasValidAccess } = getBookingAccessContext(request)
      const booking = await db.collection('bookings').findOne({ id })
      if (!booking) return json({ error: 'Booking not found' }, 404)
      if (!email || !hasValidAccess || booking.email !== email) {
        return json({ error: 'Access denied' }, 403)
      }

      await db.collection('bookings').updateOne({ id }, { $set: { status: 'cancelled' } })
      return json({ ok: true })
    }

    // ==== Google Calendar OAuth ====
    if (route === '/gcal/start' && method === 'GET') {
      const url = new URL(request.url)
      const bookingId = url.searchParams.get('bookingId')
      if (!bookingId) return json({ error: 'Missing bookingId' }, 400)
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return json({ error: 'Google Calendar is not configured on this server. Ask the site owner to add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' }, 500)
      }
      const booking = await db.collection('bookings').findOne({ id: bookingId })
      if (!booking) return json({ error: 'Booking not found' }, 404)

      const state = crypto.randomBytes(16).toString('hex')
      await db.collection('oauth_states').insertOne({
        state, bookingId, createdAt: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })

      const redirectUri = getGoogleRedirectUri(request)
      const client = oauthAuthUrl(state, redirectUri)
      return NextResponse.redirect(client)
    }

    if (route === '/gcal/callback' && method === 'GET') {
      const url = new URL(request.url)
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      const err = url.searchParams.get('error')

      if (err) return NextResponse.redirect(`${BASE_URL}/?gcal=denied`)
      if (!code || !state) return json({ error: 'Missing code/state' }, 400)

      const stateRow = await db.collection('oauth_states').findOne({ state })
      if (!stateRow) return json({ error: 'Invalid or expired state' }, 400)
      await db.collection('oauth_states').deleteOne({ state })

      const redirectUri = getGoogleRedirectUri(request)
      const tokens = await exchangeCodeForTokens(code, redirectUri)
      const accessToken = tokens.access_token

      const booking = await db.collection('bookings').findOne({ id: stateRow.bookingId })
      if (!booking) return json({ error: 'Booking not found' }, 404)

      const tz = booking.timeZone || 'UTC'
      const created = await insertCalendarEvent(accessToken, {
        summary: booking.serviceName,
        description: `Lumen appointment\n\nBooking ID: ${booking.id}${booking.notes ? '\n\nNotes: ' + booking.notes : ''}`,
        start: { dateTime: booking.startLocal || booking.startISO, timeZone: tz },
        end: { dateTime: booking.endLocal || booking.endISO, timeZone: tz },
        reminders: { useDefault: true },
      })

      await db.collection('bookings').updateOne(
        { id: booking.id },
        { $set: {
          gcalSynced: true,
          gcalEventId: created.id,
          gcalEventLink: created.htmlLink,
          gcalRefreshToken: tokens.refresh_token || booking.gcalRefreshToken || null,
        } }
      )

      const successUrl = `${getBaseUrl(request)}/?gcal=success&email=${encodeURIComponent(booking.email)}`
      return NextResponse.redirect(successUrl)
    }

    if (route === '' || route === '/') return json({ ok: true, name: 'Lumen Appointment API' })
    return json({ error: 'Not found', route }, 404)
  } catch (e) {
    console.error(e)
    return json({ error: e.message }, 500)
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
