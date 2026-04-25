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

        // Check user's plan from publicMetadata (set by Clerk billing)
        // Also check unsafeMetadata as fallback for testing
        const plan = (user.publicMetadata?.plan || user.unsafeMetadata?.plan) as PlanType;

        console.log('User publicMetadata:', user.publicMetadata);
        console.log('User unsafeMetadata:', user.unsafeMetadata);
        console.log('Detected plan:', plan);

        if (plan === 'pro' || plan === 'standard') {
            return plan;
        }

        // TEMPORARY: For testing, return 'standard' if plan is not set
        // Remove this after Clerk billing is properly configured
        console.warn('Plan not set in metadata, defaulting to standard for testing');
        return 'standard';
    } catch (error) {
        console.error('Error fetching user plan:', error);
        return 'free';
    }
};
