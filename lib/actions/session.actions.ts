"use server"

import { connectToDatabase } from "@/database/mongoose";
import {StartSessionResult, EndSessionResult} from "@/types";
import { getCurrentBillingPeriodStart } from "../subscription-constants";
import VoiceSession from "@/database/models/voiceSession.model";

export const startVoiceSession=async(clerkId : string,bookId : string):Promise<StartSessionResult>=>{
    try{
await connectToDatabase();
const session=await VoiceSession.create({
    clerkId,
    bookId,
    startedAt:new Date(),
    billingPeriodStart:getCurrentBillingPeriodStart(),
    durationSeconds:0,
});

return{
    success:true,
    sessionId:session._id.toString(),
};
    }
    catch(e){
console.error("Error starting voice session");
return{
    success:false,
    error:'failed to start voice session. Please try again later.'
}
    }
}

export const endVoiceSession = async(sessionId: string, durationSeconds: number): Promise<EndSessionResult> => {
    try {
        await connectToDatabase();
        const session = await VoiceSession.findByIdAndUpdate(
            sessionId,
            {
                endedAt: new Date(),
                durationSeconds: durationSeconds
            },
            { new: true }
        );

        if (!session) {
            return {
                success: false,
                error: 'Session not found'
            };
        }

        return {
            success: true
        };
    }
    catch (e) {
        console.error("Error ending voice session", e);
        return {
            success: false,
            error: 'failed to end voice session. Please try again later.'
        };
    }
}
