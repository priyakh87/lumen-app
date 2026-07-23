'use client'

import { ArrowRight } from 'lucide-react'

export default function Hero({ onStart }) {
  return (
    <section className="relative pt-40 pb-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="hero-animate-item hero-animate-delay-1 inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-fg-muted mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Now booking · {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <h1 className="hero-animate-item hero-animate-delay-2 text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-fg">
          Appointments that feel<br/><span className="gradient-text">effortlessly beautiful.</span>
        </h1>
        <p className="hero-animate-item hero-animate-delay-3 mt-6 text-fg-muted text-lg md:text-xl max-w-2xl mx-auto">
          A calm, cinematic booking experience — pick a service, choose a time, and you’re set. No back-and-forth.
        </p>
        <div className="hero-animate-item hero-animate-delay-4 mt-10 flex items-center justify-center gap-3 flex-wrap">
          <button onClick={onStart} className="glass-strong shimmer-button rounded-2xl px-6 py-3 text-fg font-medium inline-flex items-center gap-2 hover:scale-[1.02] transition">
            Book an appointment <ArrowRight className="w-4 h-4" />
          </button>
          <a href="#services" className="glass rounded-2xl px-6 py-3 text-fg font-medium hover:scale-[1.02] transition">Explore services</a>
        </div>
        <div className="hero-animate-item hero-animate-delay-5 mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[{k:'2,400+',v:'sessions booked'},{k:'4.9★',v:'average rating'},{k:'<30s',v:'to schedule'}].map((s,i)=>(
            <div key={i} className="glass-subtle rounded-2xl px-4 py-4">
              <div className="text-2xl md:text-3xl font-semibold text-fg">{s.k}</div>
              <div className="text-xs text-fg-subtle mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
