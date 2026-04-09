'use server'
import { CreateBook, TextSegment } from "@/types.d";
import Book from "@/database/models/book.model";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import BookSegment from "@/database/models/bookSegment.model";

export const checkBookExists=async(text:string)=>{
    console.log('🔍 Checking if book exists:', text);
    try {
        console.log('📡 Connecting to database...');
        await connectToDatabase();
        console.log('📡 Database connection established');
       const slug=generateSlug(text);
       console.log('🔎 Searching for book with slug:', slug);
       const existingBook=await Book.findOne({ slug }).lean();
       if(existingBook){
        console.log('✅ Book already exists:', existingBook.title);
        return {
            exists:true,
            book:serializeData(existingBook)
        }
       }
       console.log('ℹ️ Book does not exist, can create new one');
       return {
        exists:false,
       }
    } catch (error) {
        console.log('Error checking book exists',error);
        return {
            exists:false,
            error
        }
    }
}
export const createBook = async (data: CreateBook) => {
    console.log('🆕 Creating new book:', data.title);
    try {
        console.log('📡 Connecting to database...');
        await connectToDatabase();
        console.log('📡 Database connection established');
        const slug = generateSlug(data.title);
        console.log('🔎 Checking for existing book with slug:', slug);
        const existingBook = await Book.findOne({ slug }).lean();
        
        if (existingBook) {
            console.log('⚠️ Book already exists, returning existing book');
            return {
                success: true,
                book: serializeData(existingBook),  // ✅ Changed from 'data' to 'book'
                alreadyExists: true
            }
        }

        console.log('✨ Creating new book in database...');
        const book = await Book.create({ ...data, slug, totalSegments: 0 });
        console.log('🎉 Book created successfully:', book.title);
        return {
            success: true,
            book: serializeData(book),
            alreadyExists: false  // ✅ Added for consistency
        }
    } catch (error) {
        console.error('❌ Error creating book:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'  // ✅ Return error message
        }
    }
}
export const savedBookSegments=async(bookId:string,clerkId:string,segments:TextSegment[])=>{
    try {
        await connectToDatabase();

        console.log("Saving book segments...");
       const segmentsToInsert=segments.map(({text,segmentIndex,pageNumber,wordCount})=>({
        clerkId,
        bookId,
        content:text,
        segmentIndex,
        pageNumber,
        wordCount

       }));
       await BookSegment.insertMany(segmentsToInsert);
       await Book.findByIdAndUpdate(bookId, { totalSegments: segments.length });
       console.log("Book segments saved successfully");
       return{
        success:true,
        data:{segmentsCreated:segments.length}
       }
    } catch (error) {
        console.log("error saving book segment",error);
        await BookSegment.deleteMany({bookId});
        await Book.findByIdAndDelete(bookId);
        console.log("Deleted book segments and book due to failure to save segments");
        return{
            success:false,
            error:"Failed to save book segments"
        }
    }
}