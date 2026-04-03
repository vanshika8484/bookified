import { MAX_FILE_SIZE } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { config } from "dotenv";

// Load environment variables
config();

export async function POST(request:Request):Promise<NextResponse> {
    console.log('📤 Upload request received');
    
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('❌ BLOB_READ_WRITE_TOKEN is not configured');
        return NextResponse.json(
            { error: "Server configuration error: BLOB_READ_WRITE_TOKEN not set" }, 
            { status: 500 }
        );
    }
    
    console.log('✅ BLOB_READ_WRITE_TOKEN is configured');
    
    const body=(await request.json()) as HandleUploadBody;
    console.log('📋 Upload body:', body);
    
    try{
        console.log('🔄 Processing upload...');
        const jsonResponse=await handleUpload({
            token:process.env.BLOB_READ_WRITE_TOKEN,
            body,request,onBeforeGenerateToken:async()=>{
            console.log('🔐 Authenticating user...');
            const {userId}=await auth();
            if(!userId){
                console.error('❌ User not authenticated');
                throw new Error("Unauthorized:User not authenticated");
            }
            console.log('✅ User authenticated:', userId);
            return {
                allowedContentTypes:["application/pdf",'image/jpeg','image/png','image/webp'],
                addRandomSuffix:true,
                maximumSizeInBytes:MAX_FILE_SIZE,
                tokenPayload:JSON.stringify({userId}),
            }
        },
        onUploadCompleted:async({blob,tokenPayload})=>{
            console.log("🎉 Upload completed:", blob.url);
            const payload=tokenPayload?JSON.parse(tokenPayload):null;
            const userId=payload?.userId;

            //TODO:PostHog
        }
    });
    console.log('✅ Upload processed successfully');
    return NextResponse.json(jsonResponse);

}catch(error){
    const message=error instanceof Error ? error.message : "Unknown error";
    console.error('❌ Upload failed:', message);
    console.error('🔧 Full error:', error);
    
    const status=message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
}
}