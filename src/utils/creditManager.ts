
import { toast } from "@/hooks/use-toast";
import { CreditTransaction, CreditBalance, CreditPlan, CreditUsage } from "@/types/credit";

// Mock storage - in real app, this would be in database
const CREDIT_BALANCE_KEY = 'userCreditBalance';
const CREDIT_TRANSACTIONS_KEY = 'creditTransactions';

// Available credit plans
export const CREDIT_PLANS: CreditPlan[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    description: 'Perfect for getting started'
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 500,
    price: 39.99,
    bonus: 50,
    popular: true,
    description: 'Most popular choice with bonus credits'
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 1000,
    price: 69.99,
    bonus: 200,
    description: 'Best value for heavy users'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 5000,
    price: 299.99,
    bonus: 1000,
    description: 'For large scale operations'
  }
];

// Service costs
export const SERVICE_COSTS: Record<string, CreditUsage> = {
  'website_generation': {
    service: 'Website Generation',
    cost: 10,
    description: 'Generate a complete website'
  },
  'ai_content': {
    service: 'AI Content',
    cost: 2,
    description: 'Generate AI content'
  },
  'domain_verification': {
    service: 'Domain Verification',
    cost: 1,
    description: 'Verify domain ownership'
  },
  'hosting_deployment': {
    service: 'Hosting Deployment',
    cost: 5,
    description: 'Deploy to hosting provider'
  },
  'premium_template': {
    service: 'Premium Template',
    cost: 15,
    description: 'Access premium templates'
  }
};

// Get current user's credit balance
export const getCreditBalance = (): CreditBalance => {
  if (typeof window === 'undefined') {
    return {
      userId: 'guest',
      totalCredits: 0,
      availableCredits: 0,
      reservedCredits: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
      lastUpdated: new Date()
    };
  }

  const stored = localStorage.getItem(CREDIT_BALANCE_KEY);
  if (stored) {
    const balance = JSON.parse(stored);
    return {
      ...balance,
      lastUpdated: new Date(balance.lastUpdated)
    };
  }

  // Initialize with welcome bonus
  const initialBalance: CreditBalance = {
    userId: 'user-1', // In real app, get from auth
    totalCredits: 50,
    availableCredits: 50,
    reservedCredits: 0,
    lifetimeEarned: 50,
    lifetimeSpent: 0,
    lastUpdated: new Date()
  };

  localStorage.setItem(CREDIT_BALANCE_KEY, JSON.stringify(initialBalance));
  return initialBalance;
};

// Update credit balance
export const updateCreditBalance = (balance: Partial<CreditBalance>): CreditBalance => {
  const current = getCreditBalance();
  const updated = {
    ...current,
    ...balance,
    lastUpdated: new Date()
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(CREDIT_BALANCE_KEY, JSON.stringify(updated));
  }

  return updated;
};

// Get credit transactions
export const getCreditTransactions = (): CreditTransaction[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(CREDIT_TRANSACTIONS_KEY);
  if (stored) {
    return JSON.parse(stored).map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt)
    }));
  }
  return [];
};

// Add credit transaction
export const addCreditTransaction = (transaction: Omit<CreditTransaction, 'id' | 'createdAt'>): CreditTransaction => {
  const newTransaction: CreditTransaction = {
    ...transaction,
    id: Math.random().toString(36).substring(7),
    createdAt: new Date()
  };

  const transactions = getCreditTransactions();
  transactions.unshift(newTransaction);

  if (typeof window !== 'undefined') {
    localStorage.setItem(CREDIT_TRANSACTIONS_KEY, JSON.stringify(transactions));
  }

  return newTransaction;
};

// Purchase credits
export const purchaseCredits = (planId: string): boolean => {
  const plan = CREDIT_PLANS.find(p => p.id === planId);
  if (!plan) return false;

  const balance = getCreditBalance();
  const creditsToAdd = plan.credits + (plan.bonus || 0);

  // Update balance
  updateCreditBalance({
    totalCredits: balance.totalCredits + creditsToAdd,
    availableCredits: balance.availableCredits + creditsToAdd,
    lifetimeEarned: balance.lifetimeEarned + creditsToAdd
  });

  // Add transaction
  addCreditTransaction({
    userId: balance.userId,
    type: 'purchase',
    amount: creditsToAdd,
    description: `Purchased ${plan.name}`,
    metadata: {
      planId: plan.id,
      orderId: `order_${Date.now()}`
    }
  });

  toast({
    title: "Credits purchased successfully",
    description: `Added ${creditsToAdd} credits to your account`,
  });

  return true;
};

// Use credits for a service
export const useCredits = (serviceKey: string, customAmount?: number): boolean => {
  const service = SERVICE_COSTS[serviceKey];
  const amount = customAmount || service?.cost || 0;

  if (!service && !customAmount) {
    toast({
      title: "Invalid service",
      description: "Service not found",
      variant: "destructive"
    });
    return false;
  }

  const balance = getCreditBalance();

  if (balance.availableCredits < amount) {
    toast({
      title: "Insufficient credits",
      description: `You need ${amount} credits but only have ${balance.availableCredits}`,
      variant: "destructive"
    });
    return false;
  }

  // Update balance
  updateCreditBalance({
    availableCredits: balance.availableCredits - amount,
    lifetimeSpent: balance.lifetimeSpent + amount
  });

  // Add transaction
  addCreditTransaction({
    userId: balance.userId,
    type: 'usage',
    amount: -amount,
    description: service?.description || `Used ${amount} credits`,
    metadata: {
      service: serviceKey
    }
  });

  toast({
    title: "Credits used",
    description: `Used ${amount} credits for ${service?.service || 'service'}`,
  });

  return true;
};

// Add bonus credits
export const addBonusCredits = (amount: number, description: string): void => {
  const balance = getCreditBalance();

  updateCreditBalance({
    totalCredits: balance.totalCredits + amount,
    availableCredits: balance.availableCredits + amount,
    lifetimeEarned: balance.lifetimeEarned + amount
  });

  addCreditTransaction({
    userId: balance.userId,
    type: 'bonus',
    amount: amount,
    description: description
  });

  toast({
    title: "Bonus credits added",
    description: `${amount} bonus credits added to your account`,
  });
};

// Check if user has enough credits
export const hasEnoughCredits = (serviceKey: string, customAmount?: number): boolean => {
  const service = SERVICE_COSTS[serviceKey];
  const amount = customAmount || service?.cost || 0;
  const balance = getCreditBalance();
  return balance.availableCredits >= amount;
};

// Get credit cost for service
export const getCreditCost = (serviceKey: string): number => {
  return SERVICE_COSTS[serviceKey]?.cost || 0;
};
