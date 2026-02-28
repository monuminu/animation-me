'use client'

import { motion } from 'framer-motion'
import { Type, Globe, Download } from 'lucide-react'

const features = [
  {
    icon: <Type className="w-5 h-5" />,
    title: 'Text to Animation',
    description: 'Describe what you want in natural language. Claude generates production-ready motion graphics instantly.',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'URL to Video',
    description: 'Paste any product URL. We auto-capture screenshots, extract brand colors, and generate an on-brand animation.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: 'Export Anywhere',
    description: 'Download as MP4, GIF, or WebM. Every animation is code-native — editable, modular, and reproducible.',
    gradient: 'from-emerald-500/20 to-green-500/20',
  },
]

export function FeaturesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3">How it works</h2>
          <p className="text-text-secondary max-w-lg mx-auto">
            Three inputs, one pipeline. Every animation is generated as structured code — not pixels.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-xl border border-border bg-bg-secondary p-6 hover:border-accent/30 transition-all duration-300"
            >
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
