import { useState } from 'react'
import ChatInput from './components/ChatInput'
import MessageList from './components/MessageList'
import UsageBar from './components/UsageBar'

const API_BASE = 'http://localhost:8000'

const SESSION_ID = `session-${Math.random().toString(36).slice(2, 9)}`

export default function App() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)

  // const [streamingEnabled, setStreamingEnabled] = useState(true)

  const [lastUsage, setLastUsage] = useState(null)
  const [error, setError] = useState(null)

  async function sendMessage(text) {
    if (!text.trim() || isStreaming) return

    setError(null)
    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsStreaming(true)

    const history = messages

    try {
      // ❌ Streaming disabled
      // if (streamingEnabled) {
      //   await streamResponse(text, history, updatedMessages)
      // } else {
      //   await fetchResponse(text, history, updatedMessages)
      // }

      // ✅ Always use non-streaming
      await fetchResponse(text, history, updatedMessages)

    } catch (err) {
      setError(err.message)
    } finally {
      setIsStreaming(false)
    }
  }

  /*
  async function streamResponse(message, history, currentMessages) {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, session_id: SESSION_ID }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || `Server error: ${response.status}`)
    }

    const assistantIndex = currentMessages.length
    setMessages([...currentMessages, { role: 'assistant', content: '' }])

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split('\n\n')
      buffer = events.pop()

      for (const event of events) {
        if (!event.startsWith('data: ')) continue
        const data = JSON.parse(event.slice(6))

        if (data.type === 'text') {
          fullText += data.content

          setMessages((prev) => {
            const updated = [...prev]
            updated[assistantIndex] = { role: 'assistant', content: fullText }
            return updated
          })
        } else if (data.type === 'done') {
          setLastUsage(data.usage)
        }
      }
    }
  }
  */

  async function fetchResponse(message, history, currentMessages) {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, session_id: SESSION_ID }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || `Server error: ${response.status}`)
    }

    const data = await response.json()
    setMessages([...currentMessages, { role: 'assistant', content: data.response }])
    setLastUsage(data.usage)
  }

  function clearChat() {
    setMessages([])
    setLastUsage(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-title">
          <h1>Aimo</h1>
          <h2>Your always-available and helpful study buddy</h2>
          <span className="session-id">Session: {SESSION_ID}</span>
        </div>

        {/* ❌ Streaming toggle disabled */}
        {/*
        <div className="header-controls">
          <label className="streaming-toggle">
            <input
              type="checkbox"
              checked={streamingEnabled}
              onChange={(e) => setStreamingEnabled(e.target.checked)}
              disabled={isStreaming}
            />
            <span>Streaming</span>
          </label>
        </div>
        */}

        <div className='btn-flex'>
          <button onClick={clearChat} className="btn-clear" disabled={isStreaming}>
            Clear chat
          </button>
        </div>
      </header>

      <div className='messagelist'>
        <MessageList messages={messages} isStreaming={isStreaming} />
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming} />

      {lastUsage && <UsageBar usage={lastUsage} />}

      <div className="error-banner">
        <span>{error}</span>
      </div>
    </div>
  )
}