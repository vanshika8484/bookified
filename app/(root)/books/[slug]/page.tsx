import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getBookBySlug } from '@/lib/actions/book.actions'
import { MicOff, Mic, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/')
  }

  const { slug } = await params
  const bookResult = await getBookBySlug(slug)

  if (!bookResult.success || !bookResult.data) {
    redirect('/')
  }

  const book = bookResult.data

  return (
    <div className="book-page-container">
      <Link href="/" className="back-btn-floating">
        <ArrowLeft className="w-5 h-5 text-[var(--text-primary)]" />
      </Link>

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
            <button className="vapi-mic-btn vapi-mic-btn-inactive absolute bottom-10 left-30 shadow-lg">
              <MicOff className="w-6 h-6 text-[var(--text-primary)]" />
            </button>
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

        {/* Transcript Area */}
        <div className="transcript-container min-h-[400px]">
          <div className="transcript-empty">
            <Mic className="w-12 h-12 text-[var(--text-muted)] mb-4" />
            <p className="transcript-empty-text">No conversation yet</p>
            <p className="transcript-empty-hint">
              Click the mic button above to start talking
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
