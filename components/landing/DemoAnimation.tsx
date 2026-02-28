'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const demoScenes = [
  {
    id: 0,
    bg: 'linear-gradient(135deg, #0d1117 0%, #1a1a2e 100%)',
    content: (
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl font-bold text-white mb-2"
        >
          Ship with confidence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-text-secondary text-sm"
        >
          Deploy faster than ever before
        </motion.p>
      </div>
    ),
  },
  {
    id: 1,
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    content: (
      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        {['10x Faster', '99.9% Uptime', '150+ Integrations'].map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3 text-center"
          >
            <div className="text-lg font-bold text-white">{text.split(' ')[0]}</div>
            <div className="text-2xs text-text-muted mt-0.5">{text.split(' ').slice(1).join(' ')}</div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    bg: 'linear-gradient(135deg, #0a0a0b 0%, #1a0a2e 100%)',
    content: (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30"
        >
          <span className="text-2xl">✦</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400"
        >
          Start creating today
        </motion.h2>
      </div>
    ),
  },
]

export function DemoAnimation() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % demoScenes.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Mock video player */}
        <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-accent/5">
          {/* Title bar */}
          <div className="h-8 bg-bg-secondary/80 border-b border-border/50 flex items-center px-3 gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="text-2xs text-text-muted ml-2">animation.me preview</span>
          </div>

          {/* Canvas */}
          <div className="aspect-video relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={demoScenes[current].id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center p-8"
                style={{ background: demoScenes[current].bg }}
              >
                {demoScenes[current].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="h-8 bg-bg-secondary/80 border-t border-border/50 flex items-center justify-center gap-2">
            {demoScenes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'bg-accent w-6' : 'bg-text-muted/30 hover:bg-text-muted/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
