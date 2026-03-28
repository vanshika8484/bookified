import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import { sampleBooks } from '@/lib/constants'
import React from 'react'

const Page = () => {
    return (
        <div>
            <HeroSection />
            <div className=' wrapper library-books-grid'>
                {sampleBooks.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
                ))}
            </div>
        </div>
    )
}
export default Page
