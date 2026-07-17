const crypto = require('crypto')

function createBookingAccessValue(email, secret) {
  if (!email || !secret) return null
  const normalized = String(email).trim().toLowerCase()
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(normalized)
  return `${normalized}:${hmac.digest('hex')}`
}

function verifyBookingAccessValue(value, email, secret) {
  if (!value || !email || !secret) return false

  const normalized = String(email).trim().toLowerCase()
  const expected = createBookingAccessValue(normalized, secret)

  if (!expected) return false

  return value === expected
}

module.exports = {
  createBookingAccessValue,
  verifyBookingAccessValue,
}
