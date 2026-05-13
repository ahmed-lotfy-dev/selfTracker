import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { API_BASE_URL } from "@/lib/api/axiosInstance"

interface Message { role: 'user' | 'ai'; text: string }

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Hey there! I am your fitness AI coach. I can analyze your weight loss journey, workout patterns, and give you personalized advice based on your SelfTracker data. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = useCallback(async () => {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: msg }, { role: 'ai', text: '' }])
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    const token = localStorage.getItem("bearer_token")

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.text()
        setMessages(m => {
          const copy = [...m]
          copy[copy.length - 1] = { role: 'ai', text: `Error: ${err || res.status}` }
          return copy
        })
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('event: token')) continue
          if (!trimmed.startsWith('data: ')) continue
          const data = JSON.parse(trimmed.slice(6))
          if (data.token) {
            setMessages(m => {
              const copy = [...m]
              const last = copy[copy.length - 1]
              copy[copy.length - 1] = { role: 'ai', text: last.text + data.token }
              return copy
            })
          }
          if (data.error) {
            setMessages(m => {
              const copy = [...m]
              copy[copy.length - 1] = { role: 'ai', text: `Error: ${data.error}` }
              return copy
            })
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(m => {
        const copy = [...m]
        const last = copy[copy.length - 1]
        if (last && last.role === 'ai' && !last.text) {
          copy[copy.length - 1] = { role: 'ai', text: 'Connection error. Is the backend running?' }
        }
        return copy
      })
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, messages])

  return (
    <div className="p-6 space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Fitness Coach</h1>
        <p className="text-sm text-muted-foreground mt-1">Powered by Qdrant + NVIDIA AI • Ask about your progress</p>
      </div>

      <div className="flex-1 rounded-2xl border bg-card flex flex-col min-h-0 p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot size={16} className="text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent border border-border'}`}>
                <p className="text-sm whitespace-pre-wrap">{m.text || (loading ? ' ' : '')}</p>
                {m.role === 'ai' && !m.text && loading && <Loader2 size={14} className="animate-spin text-primary mt-1" />}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 mt-1">
                  <User size={16} className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-3 border-t border-border">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about your progress, training advice, patterns..."
            className="flex-1 bg-accent border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 transition-colors" />
          <button onClick={send} disabled={loading || !input.trim()}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-40">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
