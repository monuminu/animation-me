'use client'

import { useState } from 'react'
import { Zap, Send, ArrowRight } from 'lucide-react'
import { useAnimate } from '@/hooks/useAnimate'
import { useProjectStore } from '@/stores/project-store'

export function BottomBar() {
  const [input, setInput] = useState('')
  const { isGenerating } = useProjectStore()
  const { generate } = useAnimate()

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isGenerating) return
    setInput('')
    generate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const quickActions = [
    'Make it faster',
    'Add more scenes',
    'Change to blue theme',
    'Add a logo reveal intro',
  ]

  return (
    <div className="h-12 flex items-center gap-3 px-4 border-t border-border bg-bg-secondary/50 flex-shrink-0">
      <button
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors flex-shrink-0"
      >
        <Zap className="w-3 h-3" />
        Quick Edit
      </button>

      <div className="flex-1 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Quick iteration — e.g., 'make the intro faster' or 'change colors to blue'"
          disabled={isGenerating}
          className="w-full h-8 rounded-md bg-bg-elevated border border-border px-3 pr-8 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isGenerating}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-text-muted hover:text-accent disabled:opacity-30 transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
