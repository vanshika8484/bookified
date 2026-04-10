import { notFound } from 'next/navigation'
import Book from '@/database/models/book.model'
import { connectToDatabase } from '@/database/mongoose'
import { serializeData } from '@/lib/utils'

async function getBook(slug: string) {
  try {
    await connectToDatabase()
    const book = await Book.findOne({ slug }).lean()
    if (!book) {
      return null
    }
    return serializeData(book)
  } catch (error) {
    console.error('Error fetching book:', error)
    return null
  }
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const book = await getBook(slug)

  if (!book) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12">
      <div className="wrapper">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[var(--bg-secondary)] rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              {book.title}
            </h1>
            <p className="text-lg text-[var(--text-secondary)] mb-6">
              By {book.author}
            </p>
            {book.coverURL && (
              <img
                src={book.coverURL}
                alt={book.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  File
                </h3>
                <a
                  href={book.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-brand)] hover:underline"
                >
                  View PDF
                </a>
              </div>
              {book.persona && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Assistant Persona
                  </h3>
                  <p className="text-[var(--text-primary)]">{book.persona}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  Total Segments
                </h3>
                <p className="text-[var(--text-primary)]">{book.totalSegments || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
