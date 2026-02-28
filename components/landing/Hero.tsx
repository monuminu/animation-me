'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { generateId } from '@/lib/utils'
import { useProjectStore } from '@/stores/project-store'

const examplePrompts = [
  'Product launch video',
  'Logo animation',
  'SaaS demo reel',
  'Pricing comparison',
  'Feature walkthrough',
  '3D showcase',
]

export function Hero() {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()
  const { setInitialPrompt } = useProjectStore()

  const handleGenerate = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    const projectId = generateId()
    setInitialPrompt(trimmed)
    router.push(`/studio/${projectId}`)
  }

  const handleExampleClick = (example: string) => {
    const projectId = generateId()
    setInitialPrompt(example)
    router.push(`/studio/${projectId}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleGenerate()
    }
  }

  return (
    <section className="relative pt-32 pb-16 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Text-to-animation engine
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-4"
        >
          Animate everything.{' '}
          <span className="text-gradient">Just describe it.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Generate production-ready motion graphics from natural language.
          Product launch videos, logo animations, demo reels — in seconds.
        </motion.p>

        {/* Prompt Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-2xl mx-auto mb-6"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-bg-secondary rounded-xl border border-border focus-within:border-accent/50 transition-colors overflow-hidden">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe the animation you want to create..."
                rows={3}
                className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-base text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <span className="text-2xs text-text-muted">
                  <kbd className="px-1.5 py-0.5 rounded bg-bg-hover text-text-secondary">Cmd+Enter</kbd> to generate
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30"
                >
                  Generate
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span className="text-xs text-text-muted mr-1">Try:</span>
          {examplePrompts.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              className="px-3 py-1.5 rounded-full text-xs bg-bg-elevated border border-border hover:border-accent/30 hover:bg-accent/5 text-text-secondary hover:text-text-primary transition-all duration-200"
            >
              {example}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
