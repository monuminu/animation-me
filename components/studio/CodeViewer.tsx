'use client'

import { ScrollArea } from '@/components/ui/scroll-area'

interface CodeViewerProps {
  code: string
  language?: string
}

export function CodeViewer({ code, language = 'tsx' }: CodeViewerProps) {
  const lines = code.split('\n')

  return (
    <ScrollArea className="h-full">
      <div className="p-3 font-mono text-2xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-8 text-right pr-3 text-text-muted/50 select-none flex-shrink-0">
              {i + 1}
            </span>
            <pre className="text-text-secondary whitespace-pre overflow-x-auto">
              <code>{highlightSyntax(line)}</code>
            </pre>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

// Simple syntax highlighting (no external dep)
function highlightSyntax(line: string): React.ReactNode {
  // Very basic keyword highlighting
  const keywords = /\b(import|export|from|const|let|var|function|return|if|else|for|while|true|false|null|undefined|new|class|extends|interface|type|async|await|default)\b/g
  const strings = /(["'`])((?:\\.|(?!\1).)*?)\1/g
  const comments = /(\/\/.*$)/g
  const jsx = /(<\/?[A-Z][a-zA-Z]*)/g
  const numbers = /\b(\d+(?:\.\d+)?)\b/g

  let result = line

  // We'll do a simple approach: return the raw text with some color spans
  // This avoids complex regex overlap issues
  const parts: { start: number; end: number; className: string }[] = []

  let match
  // Comments first (they override everything)
  while ((match = comments.exec(line)) !== null) {
    parts.push({ start: match.index, end: match.index + match[0].length, className: 'text-text-muted/60' })
  }

  // If we have a comment spanning the whole line, just return it
  if (parts.length > 0 && parts[0].start === 0) {
    return <span className="text-text-muted/60">{line}</span>
  }

  // For simplicity, just return the line with basic coloring
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: line
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(
            /\b(import|export|from|const|let|var|function|return|if|else|default|type|interface)\b/g,
            '<span style="color:#c084fc">$1</span>'
          )
          .replace(
            /(["'`])((?:\\.|(?!\1).)*?)\1/g,
            '<span style="color:#34d399">$1$2$1</span>'
          )
          .replace(
            /\b(\d+(?:\.\d+)?)\b/g,
            '<span style="color:#fb923c">$1</span>'
          )
          .replace(
            /(\/\/.*$)/g,
            '<span style="color:#6b7280">$1</span>'
          ),
      }}
    />
  )
}
