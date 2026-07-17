const { createBookingAccessValue, verifyBookingAccessValue } = require('../lib/bookingAccess')

describe('booking access helpers', () => {
  const secret = 'test-secret'

  it('creates and verifies a matching access value', () => {
    const value = createBookingAccessValue('ada@example.com', secret)

    expect(verifyBookingAccessValue(value, 'ada@example.com', secret)).toBe(true)
  })

  it('rejects a value for a different email', () => {
    const value = createBookingAccessValue('ada@example.com', secret)

    expect(verifyBookingAccessValue(value, 'grace@example.com', secret)).toBe(false)
  })

  it('rejects a tampered value', () => {
    const value = createBookingAccessValue('ada@example.com', secret)
    const tampered = value.replace('a', 'b')

    expect(verifyBookingAccessValue(tampered, 'ada@example.com', secret)).toBe(false)
  })
})
