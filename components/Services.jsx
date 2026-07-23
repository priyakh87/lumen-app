'use client'

import {
  Clock, Sparkles, Palette, Compass, Cpu,
  ChevronRight,
} from 'lucide-react'

const iconMap = { sparkles: Sparkles, palette: Palette, compass: Compass, cpu: Cpu }

function applyTilt(event) {
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  const rect = el.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const px = (x / rect.width - 0.5) * 2
  const py = (y / rect.height - 0.5) * 2
  const rotY = px * 1
  const rotX = -py * 1
  el.style.setProperty('--tilt-x', `${rotX}deg`)
  el.style.setProperty('--tilt-y', `${rotY}deg`)
  el.style.setProperty('--tilt-spot', `${(x / rect.width) * 100}% ${(y / rect.height) * 100}%`)
}

function resetTilt(event) {
  const el = event.currentTarget
  if (!(el instanceof HTMLElement)) return
  el.style.setProperty('--tilt-x', '0deg')
  el.style.setProperty('--tilt-y', '0deg')
  el.style.setProperty('--tilt-spot', '50% 20%')
}

const tiltHandlers = { onPointerMove: applyTilt, onPointerLeave: resetTilt }

export default function Services({ services, onPick }) {
  return (
    <section id="services" className="relative px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-sm text-fg-subtle mb-2">Services</div>
            <h2 className="text-3xl md:text-4xl font-semibold text-fg tracking-tight">Pick what fits your day</h2>
          </div>
          <a href="#book" className="hidden md:inline-flex text-sm text-fg-muted hover:text-fg items-center gap-1">Go to booking <ChevronRight className="w-4 h-4" /></a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => {
            const Icon = iconMap[s.icon] || Sparkles
            return (
              <button key={s.id} onClick={() => onPick(s)} {...tiltHandlers} className="text-left glass tilt-surface rounded-3xl p-5 hover:scale-[1.02] transition group relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-40 bg-gradient-to-br ${s.color}`} />
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="mt-4 text-fg font-semibold text-lg">{s.name}</h3>
                <p className="mt-1 text-sm text-fg-muted leading-relaxed">{s.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-fg-subtle flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {s.duration}m</span>
                    <span>{s.price ? `$${s.price}` : 'Free'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-fg-subtle group-hover:translate-x-1 transition" />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
