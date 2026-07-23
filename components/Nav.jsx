'use client'

import { ArrowRight, ChevronRight, Sparkles, Sun, Moon } from 'lucide-react'

function ThemeToggle({ theme, toggle }) {
  return (
    <button onClick={toggle} className="glass rounded-xl w-9 h-9 flex items-center justify-center hover:scale-105 transition" title="Toggle theme">
      {theme === 'dark' ? <Sun className="w-4 h-4 text-fg" /> : <Moon className="w-4 h-4 text-fg" />}
    </button>
  )
}

export default function Nav({ onOpenBookings, onStart, theme, toggle }) {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,95%)]">
      <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-accent-grad shadow-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-fg tracking-tight">Lumen</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-fg-muted">
          <a href="#services" className="hover:text-fg transition">Services</a>
          <a href="#book" className="hover:text-fg transition">Book</a>
          <button onClick={onOpenBookings} className="hover:text-fg transition">My bookings</button>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} toggle={toggle} />
          <button onClick={onStart} className="glass-strong rounded-xl px-4 py-1.5 text-sm text-fg hover:scale-[1.02] transition inline-flex items-center gap-1">
            Book now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
