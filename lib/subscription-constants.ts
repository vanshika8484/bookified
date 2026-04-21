export type PlanType = 'free' | 'pro' | 'enterprise';

export const getCurrentBillingPeriodStart = ():Date => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1,0,0,0,0);
};

export const PLAN_LIMITS: Record<PlanType, { maxBooks: number }> = {
    free: {
        maxBooks: 3,
    },
    pro: {
        maxBooks: 50,
    },
    enterprise: {
        maxBooks: Infinity,
    },
};