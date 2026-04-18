import { useState } from 'react'

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="input-area">
      <div className="textarea-wrapper">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message… (Enter to send, Shift+Enter for newline)"
          disabled={disabled}
          rows={2}
          autoFocus
        />

        <button
          onClick={submit}
          disabled={disabled || !text.trim()}
          className="btn-send-inside"
        >
          {disabled ? '…' : '➤'}
        </button>
      </div>
    </div>
  )
}