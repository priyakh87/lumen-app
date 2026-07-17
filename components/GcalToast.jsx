'use client'

import { useEffect } from 'react'
import { Check, X } from 'lucide-react'

/**
 * Small toast shown after the Google Calendar OAuth flow returns.
 * status: 'success' | 'denied' | null
 */
export default function GcalToast({ status, onClose }) {
  useEffect(() => {
    if (!status) return
    const t = setTimeout(onClose, 4500)
    return () => clearTimeout(t)
  }, [status, onClose])

  if (!status) return null

  const isSuccess = status === 'success'
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80]"
      data-testid="gcal-toast"
    >
      <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        >
          {isSuccess ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <X className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="text-sm text-fg">
          {isSuccess
            ? 'Added to your Google Calendar'
            : 'Google Calendar sync was cancelled'}
        </div>
      </div>
    </div>
  )
}
