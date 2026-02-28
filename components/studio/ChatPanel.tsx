'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Sparkles } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useAnimate } from '@/hooks/useAnimate'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { generateId } from '@/lib/utils'

export function ChatPanel() {
  const [input, setInput] = useState('')
  const { messages, isGenerating, initialPrompt, setInitialPrompt } = useProjectStore()
  const { generate } = useAnimate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasTriggeredInitial = useRef(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Auto-trigger initial prompt
  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true
      const prompt = initialPrompt
      setInitialPrompt('')
      generate(prompt)
    }
  }, [initialPrompt, generate, setInitialPrompt])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isGenerating) return
    setInput('')
    generate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  return (
    <div className="h-full flex flex-col bg-bg-secondary">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Chat</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Describe your animation
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              Tell me what you want to animate — a product launch video, logo animation, demo reel, or anything else.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}

        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-thinking" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-thinking" style={{ animationDelay: '200ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-thinking" style={{ animationDelay: '400ms' }} />
            </div>
            <span className="text-xs text-text-muted">Generating animation...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your animation..."
            rows={1}
            className="w-full resize-none rounded-lg bg-bg-elevated border border-border px-3 py-2.5 pr-20 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <button className="p-1.5 rounded-md hover:bg-bg-hover text-text-muted hover:text-text-secondary transition-colors">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isGenerating}
              className="p-1.5 rounded-md bg-accent hover:bg-accent-hover text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-2xs text-text-muted mt-1.5 px-1">
          Press <kbd className="px-1 py-0.5 rounded bg-bg-hover text-text-secondary text-2xs">Cmd+Enter</kbd> to send
        </p>
      </div>
    </div>
  )
}
