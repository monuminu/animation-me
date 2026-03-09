import { NextRequest, NextResponse } from 'next/server'
import { streamAnimation } from '@/lib/claude'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { prompt, messages = [] } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_FOUNDRY_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_FOUNDRY_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false

        function safeEnqueue(data: Uint8Array) {
          if (!closed) {
            try {
              controller.enqueue(data)
            } catch {
              closed = true
            }
          }
        }

        function safeClose() {
          if (!closed) {
            closed = true
            try {
              controller.close()
            } catch {
              // Already closed
            }
          }
        }

        try {
          for await (const chunk of streamAnimation(prompt, messages)) {
            const data = JSON.stringify(chunk)
            safeEnqueue(encoder.encode(`data: ${data}\n\n`))
          }

          safeEnqueue(encoder.encode('data: [DONE]\n\n'))
          safeClose()
        } catch (error) {
          console.error('Stream error:', error)
          const errorData = JSON.stringify({
            type: 'text',
            content: '\n\nSorry, there was an error generating your animation. Please try again.',
          })
          safeEnqueue(encoder.encode(`data: ${errorData}\n\n`))
          safeEnqueue(encoder.encode('data: [DONE]\n\n'))
          safeClose()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
