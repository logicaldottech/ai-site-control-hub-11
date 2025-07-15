
export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'transfer';
  amount: number;
  description: string;
  metadata?: {
    service?: string;
    planId?: string;
    orderId?: string;
    referenceId?: string;
  };
  createdAt: Date;
}

export interface CreditBalance {
  userId: string;
  totalCredits: number;
  availableCredits: number;
  reservedCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastUpdated: Date;
}

export interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  description: string;
}

export interface CreditUsage {
  service: string;
  cost: number;
  description: string;
}
