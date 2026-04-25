'use client';

import { useUser } from '@clerk/nextjs';
import { PlanType } from '@/lib/subscription-constants';

/**
 * Client-side hook to check user's subscription plan
 * Uses Clerk's user metadata to check plan subscriptions
 */
export function useSubscription() {
    const { isLoaded, isSignedIn, user } = useUser();

    const hasPlan = (plan: PlanType): boolean => {
        if (!isLoaded || !isSignedIn) {
            return plan === 'free';
        }

        // Check user's plan from publicMetadata
        const userPlan = user?.publicMetadata?.plan as PlanType;
        
        if (plan === 'free') {
            return !userPlan || userPlan === 'free';
        }

        return userPlan === plan;
    };

    const getCurrentPlan = (): PlanType => {
        if (!isLoaded || !isSignedIn) {
            return 'free';
        }

        const userPlan = user?.publicMetadata?.plan as PlanType;
        return userPlan || 'free';
    };

    return {
        isLoaded,
        isSignedIn,
        hasPlan,
        getCurrentPlan,
        hasStandard: () => hasPlan('standard'),
        hasPro: () => hasPlan('pro'),
        isFree: () => hasPlan('free'),
    };
}
