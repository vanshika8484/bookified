import BookCard from '@/components/BookCard'
import HeroSection from '@/components/HeroSection'
import SearchBar from '@/components/SearchBar'
import { getAllBooks } from '@/lib/actions/book.actions'
import React from 'react'

const Page = async ({ searchParams }: { searchParams: Promise<{ search?: string }> }) => {
    const { search } = await searchParams;
    const bookResults = await getAllBooks(search);
    const books = bookResults.success ? bookResults.data ?? [] : [];
    return (
        <div>
            <HeroSection />
            <div className='wrapper'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold text-[var(--text-primary)]'>Recent Books</h1>
                    <SearchBar />
                </div>
                <div className='library-books-grid'>
                    {books.map((book) => (
                        <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL} slug={book.slug} />
                    ))}
                </div>
            </div>
        </div>
    )
}
export default Page
