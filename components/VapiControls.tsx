'use client'
import { MicOff, Mic } from 'lucide-react'
import React from 'react'
import useVapi from '../lib/hooks/useVapi'
import { IBook } from '@/types'
import Transcript from './Transcript'

const VapiControls = ({book}:{book:IBook}) => {
  const {status,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    isActive,
    start,
    stop,} = useVapi(book);
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="vapi-header-card">
          {/* Left: Book Cover */}
          <div className="relative flex-shrink-0 mt-15">
            <img
              src={book.coverURL}
              alt={book.title}
              className="vapi-cover-image"
            />
            {/* Mic Button */}
            <div className="relative">
              {(status === 'speaking' || status === 'thinking') && (
                <span className="absolute inset-0 rounded-full bg-white animate-ping"></span>
              )}
              <button 
                onClick={isActive ? stop : start} 
                disabled={status === 'connecting'}
                className={`vapi-mic-btn absolute bottom-10 left-30 shadow-lg ${
                  isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
                } relative z-10`}
              >
                {isActive ? (
                  <Mic className="w-6 h-6 text-[var(--text-primary)]" />
                ) : (
                  <MicOff className="w-6 h-6 text-[var(--text-primary)]" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Book Info */}
          <div className="flex-1">
            <h1 className="font-ibm-plex-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
              {book.title}
            </h1>
            <p className="text-[var(--text-secondary)] mb-4">
              by {book.author}
            </p>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready"></span>
                <span className="vapi-status-text">Ready</span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">
                  Voice: {book.persona || 'Default'}
                </span>
              </div>
              <div className="vapi-status-indicator">
                <span className="vapi-status-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </div>
        </div>

   <div className="vapi-transcript-wrapper">
          <Transcript
            messages={messages}
            currentMessage={currentMessage}
            currentUserMessage={currentUserMessage}
          />
        </div>
        </>
  )
}


export default VapiControls