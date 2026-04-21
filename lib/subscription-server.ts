import { auth } from "@clerk/nextjs/server";
import { PlanType } from "./subscription-constants";

export const getUserPlan = async (): Promise<PlanType> => {
    const { userId } = await auth();

    // TODO: Integrate with your actual subscription/billing system
    // For now, return 'free' as default plan
    // You can fetch the user's actual plan from your database or payment provider

    return 'free';
};
