'use server'
import { CreateBook, TextSegment } from "@/types.d";
import Book from "@/database/models/book.model";
import { connectToDatabase } from "@/database/mongoose";
import { generateSlug, serializeData } from "../utils";
import BookSegment from "@/database/models/bookSegment.model";

export const checkBookExists=async(text:string)=>{
    try {
        await connectToDatabase();
       const slug=generateSlug(text);
       const existingBook=await Book.findOne({ slug }).lean();
       return {
        exists:true,
       book:serializeData(existingBook)
       }
    } catch (error) {
        console.log('Error checking book exists',error);
        return {
            exists:false,
            error
        }
    }
}
export const createBook=async(data:CreateBook)=>{
    try {
        await connectToDatabase();
        const slug=generateSlug(data.title);
        const existingBook=await Book.findOne({ slug }).lean();
        if(existingBook){
            return {
                success: true,
                book: serializeData(existingBook),
                alreadyExists: true
            }
        }

    return{
        exists:false
    }

        //Todo: Check subscription limits before creating a book
        const book=await Book.create({...data, slug,totalSegments:0});
        return {
            success: true,
            data: serializeData(book),
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: error
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