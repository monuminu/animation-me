'use client'

import { User, Sparkles } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-2.5 animate-fade-up', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-accent" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-accent/15 text-text-primary border border-accent/20'
            : 'bg-bg-elevated text-text-secondary border border-border'
        )}
      >
        {message.content.split('\n').map((line, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
            {line}
          </p>
        ))}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-md bg-bg-elevated border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3 h-3 text-text-muted" />
        </div>
      )}
    </div>
  )
}
