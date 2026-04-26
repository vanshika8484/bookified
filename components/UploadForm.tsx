'use client'
import React, { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, Image, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { voiceOptions, voiceCategories } from '@/lib/constants'
import {useAuth} from "@clerk/nextjs"
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_PDF_TYPES, MAX_FILE_SIZE, MAX_IMAGE_SIZE } from '@/lib/constants'
import { toast } from 'sonner'
import { checkBookExists, createBook, saveBookSegments } from '@/lib/actions/book.actions'
import { parsePDFFile } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { BookUploadFormValues } from '@/types'

const formSchema = z.object({
  pdfFile: z.instanceof(File).refine(
    (file) => ACCEPTED_PDF_TYPES.includes(file.type),
    'Only PDF files are allowed'
  ).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    'File size must be less than 50MB'
  ),
  coverImage: z.instanceof(File).optional().refine(
    (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only image files are allowed'
  ).refine(
    (file) => !file || file.size <= MAX_IMAGE_SIZE,
    'Image size must be less than 10MB'
  ).optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  author: z.string().min(1, 'Author is required').max(100, 'Author too long'),
  voice: z.string().min(1, 'Please select a voice'),
  persona: z.string().optional()
})

type FormValues = z.infer<typeof formSchema>

const UploadForm = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
const {userId}=useAuth();
const router=useRouter();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      voice: 'rachel'
    }
  })

  const selectedVoice = watch('voice')

  const handlePdfDrop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null
    if (file) {
      setPdfFile(file)
      setValue('pdfFile', file)
    } else {
      setPdfFile(null)
      setValue('pdfFile', undefined as any)
    }
  }, [setValue])

  const handlePdfClick = useCallback(() => {
    document.getElementById('pdf-input')?.click()
  }, [])

  const handleCoverDrop = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null
    if (file) {
      setCoverImage(file)
      setValue('coverImage', file)
    } else {
      setCoverImage(null)
      setValue('coverImage', undefined as any)
    }
  }, [setValue])

  const handleCoverClick = useCallback(() => {
    document.getElementById('cover-input')?.click()
  }, [])

  const removePdf = useCallback(() => {
    setPdfFile(null)
    setValue('pdfFile', undefined as any)
  }, [setValue])

  const removeCover = useCallback(() => {
    setCoverImage(null)
    setValue('coverImage', undefined as any)
  }, [setValue])

 const onSubmit = async (data: FormValues) => {
    if (!userId) {
        return toast.error("Please login to upload books");
    }
    setIsSubmitting(true);

    try {
        const existsCheck = await checkBookExists(data.title);
        if (existsCheck.exists && existsCheck.book) {
            toast.info("Book with same title already exists");
            reset();
            router.push('/');
            return;
        }

        const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
        const pdfFile = data.pdfFile;
        const parsedPDF = await parsePDFFile(pdfFile);
        
        if (parsedPDF.content.length === 0) {
            toast.error("Failed to parse PDF file. Please try again.");
            return;
        }

        const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
            contentType: 'application/pdf'
        });

        let coverUrl: string;
        if (data.coverImage) {
            const coverFile = data.coverImage;
            const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: coverFile.type
            });
            coverUrl = uploadedCoverBlob.url;
        } else {
            const response = await fetch(parsedPDF.cover);
            const blob = await response.blob();
            const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                contentType: 'image/png'
            });
            coverUrl = uploadedCoverBlob.url;
        }

        const book = await createBook({
            clerkId: userId,
            title: data.title,
            author: data.author,
            persona: data.persona,
            fileURL: uploadedPdfBlob.url,
            fileBlobKey: uploadedPdfBlob.pathname,
            coverURL: coverUrl,
            fileSize: pdfFile.size
        });

        if (!book.success) {
            const errorMsg = typeof book.error === 'string' ? book.error : 'Unknown error';
            throw new Error(`Failed to create book: ${errorMsg}`);
        }

        if (book.alreadyExists) {
            toast.info("Book with same title already exists");
            reset();
            router.push('/');
            return;
        }

        const bookData = book.data;
        const segments = await saveBookSegments(bookData._id, userId, parsedPDF.content);
        
        if (!segments.success) {
            toast.error("Failed to save book segments");
            throw new Error("Failed to save book segments");
        }

        toast.success("Book uploaded successfully!");
        reset();
        router.push('/');
        
    } catch (error) {
        console.error('Book upload failed:', error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload book. Please try again.";
        toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className="new-book-wrapper">
      {isSubmitting && (
        <div className="loading-wrapper">
          <div className="loading-shadow-wrapper auth-shadow">
            <div className="loading-shadow">
              <div className="loading-animation">
                <div className="w-12 h-12 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="loading-title">Processing Your Book</h2>
              <div className="loading-progress">
                <div className="loading-progress-item">
                  <div className="loading-progress-status"></div>
                  <span>Uploading files...</span>
                </div>
                <div className="loading-progress-item">
                  <div className="loading-progress-status"></div>
                  <span>Extracting content...</span>
                </div>
                <div className="loading-progress-item">
                  <div className="loading-progress-status"></div>
                  <span>Setting up voice assistant...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* PDF File Upload */}
        <div>
          <label className="form-label">Book PDF File</label>
          <div className="upload-dropzone relative" onClick={handlePdfClick}>
            <input
              id="pdf-input"
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              {...register('pdfFile', {
                onChange: handlePdfDrop
              })}
            />
            {pdfFile ? (
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#8B7355]" />
                <div className="flex-1">
                  <div className="upload-dropzone-text">{pdfFile.name}</div>
                  <div className="upload-dropzone-hint">Click to change file</div>
                </div>
                <button
                  type="button"
                  onClick={removePdf}
                  className="upload-dropzone-remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="file-upload-shadow">
                <Upload className="upload-dropzone-icon" />
                <div className="upload-dropzone-text">Click to upload PDF</div>
                <div className="upload-dropzone-hint">PDF file (max 50MB)</div>
              </div>
            )}
          </div>
          {errors.pdfFile && (
            <p className="text-red-500 text-sm mt-2">{errors.pdfFile.message}</p>
          )}
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="form-label">Cover Image</label>
          <div className="upload-dropzone relative" onClick={handleCoverClick}>
            <input
              id="cover-input"
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              {...register('coverImage', {
                onChange: handleCoverDrop
              })}
            />
            {coverImage ? (
              <div className="flex items-center gap-3">
                <Image className="w-8 h-8 text-[#8B7355]" />
                <div className="flex-1">
                  <div className="upload-dropzone-text">{coverImage.name}</div>
                  <div className="upload-dropzone-hint">Click to change image</div>
                </div>
                <button
                  type="button"
                  onClick={removeCover}
                  className="upload-dropzone-remove"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="file-upload-shadow">
                <Image className="upload-dropzone-icon" />
                <div className="upload-dropzone-text">Click to upload cover image</div>
                <div className="upload-dropzone-hint">Leave empty to auto-generate from PDF</div>
              </div>
            )}
          </div>
          {errors.coverImage && (
            <p className="text-red-500 text-sm mt-2">{errors.coverImage.message}</p>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            placeholder="ex: Rich Dad Poor Dad"
            className="form-input"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>
          )}
        </div>

        {/* Author Input */}
        <div>
          <label htmlFor="author" className="form-label">Author Name</label>
          <input
            id="author"
            type="text"
            placeholder="ex: Robert Kiyosaki"
            className="form-input"
            {...register('author')}
          />
          {errors.author && (
            <p className="text-red-500 text-sm mt-2">{errors.author.message}</p>
          )}
        </div>

        {/* Persona Input */}
        <div>
          <label htmlFor="persona" className="form-label">Assistant Persona (Optional)</label>
          <input
            id="persona"
            type="text"
            placeholder="ex: Friendly tutor, Academic professor, Casual conversationalist"
            className="form-input"
            {...register('persona')}
          />
          {errors.persona && (
            <p className="text-red-500 text-sm mt-2">{errors.persona.message}</p>
          )}
        </div>

        {/* Voice Selector */}
        <div>
          <label className="form-label">Choose Assistant Voice</label>
          <div className="space-y-6">
            {/* Male Voices */}
            <div>
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-3">Male Voices</h3>
              <div className="voice-selector-options">
                {voiceCategories.male.map((voiceKey) => {
                  const voice = voiceOptions[voiceKey as keyof typeof voiceOptions]
                  return (
                    <div key={voiceKey} className="flex-1">
                      <label
                        className={cn(
                          'voice-selector-option',
                          selectedVoice === voiceKey ? 'voice-selector-option-selected' : 'voice-selector-option-default'
                        )}
                      >
                        <input
                          type="radio"
                          value={voiceKey}
                          {...register('voice')}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-semibold text-lg">{voice.name}</div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1">{voice.description}</div>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Female Voices */}
            <div>
              <h3 className="text-base font-medium text-[var(--text-primary)] mb-3">Female Voices</h3>
              <div className="voice-selector-options">
                {voiceCategories.female.map((voiceKey) => {
                  const voice = voiceOptions[voiceKey as keyof typeof voiceOptions]
                  return (
                    <div key={voiceKey} className="flex-1">
                      <label
                        className={cn(
                          'voice-selector-option',
                          selectedVoice === voiceKey ? 'voice-selector-option-selected' : 'voice-selector-option-default'
                        )}
                      >
                        <input
                          type="radio"
                          value={voiceKey}
                          {...register('voice')}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="font-semibold text-lg">{voice.name}</div>
                          <div className="text-sm text-[var(--text-secondary)] mt-1">{voice.description}</div>
                        </div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {errors.voice && (
            <p className="text-red-500 text-sm mt-2">{errors.voice.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="form-btn"
        >
          Begin Synthesis
        </button>
      </form>
    </div>
  )
}

export default UploadForm