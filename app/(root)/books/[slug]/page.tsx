import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getBookBySlug } from '@/lib/actions/book.actions'
import { MicOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import VapiControls from '@/components/VapiControls'

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

    
        {/* Transcript Area */}
       <VapiControls book={book} />
      </div>
  )
}
