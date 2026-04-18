'use client'
import { Mic } from 'lucide-react'
import React from 'react'

const VapiControls = () => {
  return (
   <div className="transcript-container min-h-[400px]">
          <div className="transcript-empty">
            <Mic className="w-12 h-12 text-[var(--text-muted)] mb-4" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
  )
}

export default VapiControls