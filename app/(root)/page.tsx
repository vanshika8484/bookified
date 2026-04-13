import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import { getAllBooks } from '@/lib/actions/book.actions'
import React from 'react'

const Page = async () => {
    const bookResults=await getAllBooks();
    const books=bookResults.success ? bookResults.data??[] : [];
    return (
        <div>
            <HeroSection />
            <div className=' wrapper library-books-grid'>
                {books.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
                ))}
            </div>
        </div>
    )
}
export default Page
