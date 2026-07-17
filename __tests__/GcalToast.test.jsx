import { render, screen, act } from '@testing-library/react'
import GcalToast from '@/components/GcalToast'

describe('<GcalToast />', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders nothing when status is null', () => {
    const { container } = render(<GcalToast status={null} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  test('shows success message when status is "success"', () => {
    render(<GcalToast status="success" onClose={() => {}} />)
    expect(screen.getByTestId('gcal-toast')).toBeInTheDocument()
    expect(screen.getByText(/added to your google calendar/i)).toBeInTheDocument()
  })

  test('shows cancelled message when status is "denied"', () => {
    render(<GcalToast status="denied" onClose={() => {}} />)
    expect(screen.getByText(/google calendar sync was cancelled/i)).toBeInTheDocument()
  })

  test('auto-closes after 4.5s by calling onClose', () => {
    const onClose = jest.fn()
    render(<GcalToast status="success" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    act(() => {
      jest.advanceTimersByTime(4500)
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('has appropriate a11y role for screen readers', () => {
    render(<GcalToast status="success" onClose={() => {}} />)
    const toast = screen.getByRole('status')
    expect(toast).toHaveAttribute('aria-live', 'polite')
  })
})
