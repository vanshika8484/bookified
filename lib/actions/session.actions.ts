"use server"

import { connectToDatabase } from "@/database/mongoose";
import {StartSessionResult, EndSessionResult} from "@/types";
import { getCurrentBillingPeriodStart, PLAN_LIMITS, PlanType } from "../subscription-constants";
import VoiceSession from "@/database/models/voiceSession.model";
import { auth } from "@clerk/nextjs/server";

export const startVoiceSession=async(clerkId : string,bookId : string):Promise<StartSessionResult>=>{
    try{
await connectToDatabase();

// Check user's plan and enforce limits
const { userId } = await auth();

if (!userId || userId !== clerkId) {
    return {
        success: false,
        error: 'Unauthorized'
    };
}

const { getUserPlan } = await import("../subscription-server");
const plan = await getUserPlan();
const limits = PLAN_LIMITS[plan];

// Count sessions in current billing period
const billingPeriodStart = getCurrentBillingPeriodStart();
const sessionCount = await VoiceSession.countDocuments({
    clerkId,
    billingPeriodStart
});

// Check monthly session limit
if (sessionCount >= limits.maxSessionsPerMonth) {
    return {
        success: false,
        error: `You have reached the maximum number of sessions for your ${plan} plan this month (${limits.maxSessionsPerMonth}). Please upgrade to continue.`,
        isBillingError: true,
    };
}

const session=await VoiceSession.create({
    clerkId,
    bookId,
    startedAt:new Date(),
    billingPeriodStart,
    durationSeconds:0,
});

return{
    success:true,
    sessionId:session._id.toString(),
    maxDurationMinutes: limits.maxSessionDurationMinutes,
};
    }
    catch(e){
console.error("Error starting voice session", e);
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
