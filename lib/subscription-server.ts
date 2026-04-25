import { auth, clerkClient } from "@clerk/nextjs/server";
import { PlanType } from "./subscription-constants";

export const getUserPlan = async (): Promise<PlanType> => {
    const { userId } = await auth();

    if (!userId) {
        return 'free';
    }

    try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        // Check user's plan from publicMetadata
        // Plans are configured in Clerk Dashboard with slugs "standard" and "pro"
        const plan = user.publicMetadata?.plan as PlanType;

        if (plan === 'pro' || plan === 'standard') {
            return plan;
        }

        return 'free';
    } catch (error) {
        console.error('Error fetching user plan:', error);
        return 'free';
    }
};
