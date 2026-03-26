'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const HeroSection = () => {
  return (
    <section className="container mx-auto px-4">
      <div className="library-hero-card">
        <div className="library-hero-content">
          {/* Left Section - Library Info */}
          <div className="library-hero-text">
            <h1 className="library-hero-title">Your Library</h1>
            <p className="library-hero-description">
              Organize, track, and discover your personal book collection. Add new books, manage your reading list, and explore literary adventures.
            </p>
            <Link href="/books/new" className="library-cta-primary">
              Add New Book
            </Link>
          </div>

          {/* Center Section - Illustration */}
          <div className="library-hero-illustration-desktop">
            <Image 
              src="/assets/hero-illustration.png" 
              alt="Vintage books and globe illustration" 
              width={420}
              height={270}
              className="object-contain"
            />
          </div>

          {/* Right Section - Steps Card */}
          <div className="bg-white library-cta-primary p-6 rounded-[10px] max-w-[280px]">
            <div className="space-y-4">
              <div className="library-step-item">
                <div className="library-step-number">1</div>
                <div>
                  <div className="library-step-title">Upload PDF</div>
                  <div className="library-step-description">Add books to your collection</div>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">2</div>
                <div>
                  <div className="library-step-title">AI Processing</div>
                  <div className="library-step-description">We analyze the content</div>
                </div>
              </div>
              <div className="library-step-item">
                <div className="library-step-number">3</div>
                <div>
                  <div className="library-step-title">Voice Chat</div>
                  <div className="library-step-description">Chat with our AI assistant</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection