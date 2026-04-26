'use client';

import { BookCardProps } from '@/types'
import Link from 'next/link'
import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'

const BookCard = ({title,author,coverURL,slug}:BookCardProps) => {
  const { isSignedIn } = useAuth();

  const handleClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      toast.error('Please sign in to open a book');
    }
  };

  return (
   <Link href={`/books/${slug}`} className="block" onClick={handleClick}>
    <article className='book-card '>
     <figure className='book-card-figure'>
       <div className='book-card-cover-wrapper'>
        <img src={coverURL} alt={title} width={133} height={200} className='book-card-cover'/>
       </div>
     </figure>
     <figcaption className='book-card-meta'>
      <h3 className='book-card-title'>{title}</h3>
      <p className='book-card-author'>{author}</p>
     </figcaption>
    </article>
   </Link>
  )
}

export default BookCard