import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001

// POST /api/execute — streams Claude response via SSE
app.post('/api/execute', async (req, res) => {
  const { systemPrompt, task, input, model = 'claude-opus-4-6' } = req.body as {
    systemPrompt: string
    task: string
    input?: string
    model?: string
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured. Create a .env file from .env.example.' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  const client = new Anthropic({ apiKey })

  const userContent = input
    ? `Previous context:\n${input}\n\n---\n\nTask: ${task}`
    : task

  try {
    const stream = client.messages.stream({
      model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      system: systemPrompt || 'You are a helpful AI assistant.',
      messages: [{ role: 'user', content: userContent }],
    })

    let fullText = ''

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        fullText += event.delta.text
        res.write(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`)
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done', text: fullText })}\n\n`)
    res.end()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`)
    res.end()
  }
})

// GET /api/health
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
  })
})

app.listen(PORT, () => {
  console.log(`Agency Agents server running on http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠  ANTHROPIC_API_KEY not set — copy .env.example to .env and add your key')
  }
})
