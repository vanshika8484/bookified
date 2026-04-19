'use client'
import { Mic } from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { Messages } from '@/types'

interface TranscriptProps {
  messages: Messages[]
  currentMessage: string
  currentUserMessage: string
}

const Transcript = ({ messages, currentMessage, currentUserMessage }: TranscriptProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, currentMessage, currentUserMessage])

  const hasMessages = messages.length > 0 || currentMessage || currentUserMessage

  return (
    <div className="transcript-container">
      {!hasMessages ? (
        <div className="transcript-empty">
          <Mic className="w-12 h-12 text-[var(--text-muted)] mb-4" />
          <p className="transcript-empty-text">No conversation yet</p>
          <p className="transcript-empty-hint">
            Click the mic button above to start talking
          </p>
        </div>
      ) : (
        <div className="transcript-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`transcript-message ${
                msg.role === 'user'
                  ? 'transcript-message-user'
                  : 'transcript-message-assistant'
              }`}
            >
              <div
                className={`transcript-bubble ${
                  msg.role === 'user'
                    ? 'transcript-bubble-user'
                    : 'transcript-bubble-assistant'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {currentUserMessage && (
            <div className="transcript-message transcript-message-user">
              <div className="transcript-bubble transcript-bubble-user">
                {currentUserMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          {currentMessage && (
            <div className="transcript-message transcript-message-assistant">
              <div className="transcript-bubble transcript-bubble-assistant">
                {currentMessage}
                <span className="transcript-cursor"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}

export default Transcript
