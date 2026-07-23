'use client'

import { ShieldCheck, Zap, Star } from "lucide-react";

export default function Features() {
  const items = [
    { icon: Zap, title: 'Instant confirmation', text: 'Real-time slot locking so no double bookings, ever.' },
    { icon: ShieldCheck, title: 'Private by default', text: 'Your details stay yours. Simple and secure.' },
    { icon: Star, title: 'Loved by clients', text: 'A smooth experience from first click to reminder.' },
  ]
  return (
    <section id="features" className="px-6 py-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
        {items.map((it, i) => (
          <div key={i} className="glass rounded-3xl p-6">
            <div className="w-10 h-10 rounded-xl bg-accent-grad flex items-center justify-center shadow-lg">
              <it.icon className="w-5 h-5 text-white" />
            </div>
            <div className="mt-4 text-fg font-medium">{it.title}</div>
            <div className="text-fg-muted text-sm mt-1">{it.text}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

