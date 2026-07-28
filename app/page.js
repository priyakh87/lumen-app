'use client'

import { useEffect, useState } from 'react'
import GcalToast from '@/components/GcalToast'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import Nav from '@/components/Nav'
import BookingSection from '@/components/BookingSection'
import Footer from '@/components/Footer'
import Features from '@/components/Features'

function ConfettiBurst({ count = 20 }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    const colors = ['#facc15', '#34d399', '#60a5fa', '#f472b6', '#a78bfa']
    const generated = Array.from({ length: count }, (_, index) => ({
      key: index,
      left: `${12 + Math.random() * 76}%`,
      delay: `${Math.random() * 0.4}s`,
      duration: `${1.3 + Math.random() * 0.6}s`,
      width: `${6 + Math.random() * 8}px`,
      height: `${4 + Math.random() * 3}px`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: `${Math.random() * 360}deg`,
    }))
    setPieces(generated)
    const timer = window.setTimeout(() => setPieces([]), 2200)
    return () => window.clearTimeout(timer)
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.key}
          className="confetti-piece"
          style={{
            left: piece.left,
            width: piece.width,
            height: piece.height,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  )
}

function useTheme() {
  const [theme, setTheme] = useState('light')
  useEffect(() => {
    const t = localStorage.getItem('theme') || 'light'
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
  return { theme, toggle }
}

function Orbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(1200px 800px at 15% -10%, var(--orb-1), transparent 60%), radial-gradient(1000px 700px at 100% 10%, var(--orb-2), transparent 60%), radial-gradient(900px 700px at 30% 100%, var(--orb-4), transparent 60%)' }} />
      <div className="orb animate-float" style={{ background: 'radial-gradient(circle, var(--orb-1), transparent 60%)', width: 520, height: 520, top: -120, left: -100 }} />
      <div className="orb animate-float-slow" style={{ background: 'radial-gradient(circle, var(--orb-2), transparent 60%)', width: 600, height: 600, top: 180, right: -160 }} />
      <div className="orb animate-float" style={{ background: 'radial-gradient(circle, var(--orb-3), transparent 60%)', width: 480, height: 480, bottom: -160, left: '30%' }} />
    </div>
  )
}


function App() {
  const { theme, toggle } = useTheme()
  const [services, setServices] = useState([])
  const [pickedService, setPickedService] = useState(null)
  const [showBookings, setShowBookings] = useState(false)
  const [lastEmail, setLastEmail] = useState('')
  const [gcalStatus, setGcalStatus] = useState(null)

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services')
        if (!res.ok) throw new Error(`Services request failed with ${res.status}`)
        const data = await res.json()
        setServices(data.services || [])
      } catch (error) {
        console.error('Failed to load services:', error)
        setServices([])
      }
    }

    loadServices()

    const p = new URLSearchParams(window.location.search)
    const g = p.get('gcal')
    const em = p.get('email')
    if (g) {
      setGcalStatus(g)
      if (em) { setLastEmail(em); setShowBookings(true) }
      const url = new URL(window.location.href)
      url.searchParams.delete('gcal'); url.searchParams.delete('email')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  function scrollToBook() { document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  function pick(s) { setPickedService(s); setTimeout(scrollToBook, 50) }

  return (
    <div className="relative min-h-screen">
      <Orbs />
      <Nav onOpenBookings={() => setShowBookings(true)} onStart={scrollToBook} theme={theme} toggle={toggle} />
      <Hero onStart={scrollToBook} />
      <Services services={services} onPick={pick} />
      <BookingSection services={services} initialService={pickedService} onDone={(email) => { setLastEmail(email); setShowBookings(true) }} open={showBookings} onClose={() => setShowBookings(false)} initialEmail={lastEmail} />
      <Features />
      <Footer />
      <GcalToast status={gcalStatus} onClose={() => setGcalStatus(null)} />
    </div>
  )
}

export default App
