
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, CreditCard, History, Gift, TrendingUp, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { CreditBalance, CreditTransaction, CreditPlan } from "@/types/credit";
import { 
  getCreditBalance, 
  getCreditTransactions, 
  purchaseCredits, 
  addBonusCredits,
  CREDIT_PLANS 
} from "@/utils/creditManager";
import { CreditPurchaseDialog } from "./CreditPurchaseDialog";
import { CreditTransactionHistory } from "./CreditTransactionHistory";

export function CreditManagement() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  useEffect(() => {
    loadCreditData();
  }, []);

  const loadCreditData = () => {
    setBalance(getCreditBalance());
    setTransactions(getCreditTransactions());
  };

  const handlePurchase = (planId: string) => {
    if (purchaseCredits(planId)) {
      loadCreditData();
      setIsPurchaseDialogOpen(false);
    }
  };

  const handleAddBonus = () => {
    addBonusCredits(100, "Admin bonus credits");
    loadCreditData();
  };

  if (!balance) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Management</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddBonus} variant="outline" className="flex items-center space-x-2">
            <Gift className="h-4 w-4" />
            <span>Add Bonus</span>
          </Button>
          <Button onClick={() => setIsPurchaseDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Buy Credits</span>
          </Button>
        </div>
      </div>

      {/* Credit Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Available Credits</p>
                <p className="text-3xl font-bold">{balance.availableCredits}</p>
              </div>
              <Wallet className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Credits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{balance.totalCredits}</p>
              </div>
              <Coins className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime Earned</p>
                <p className="text-2xl font-bold text-green-600">{balance.lifetimeEarned}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime Spent</p>
                <p className="text-2xl font-bold text-red-600">{balance.lifetimeSpent}</p>
              </div>
              <History className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PLANS.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Popular
                  </Badge>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {plan.credits}
                    {plan.bonus && <span className="text-sm text-green-600">+{plan.bonus}</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">credits</p>
                  <p className="text-2xl font-bold mb-3">${plan.price}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                  <Button 
                    onClick={() => handlePurchase(plan.id)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <CreditTransactionHistory 
        transactions={transactions}
        onRefresh={loadCreditData}
      />

      <CreditPurchaseDialog
        isOpen={isPurchaseDialogOpen}
        onClose={() => setIsPurchaseDialogOpen(false)}
        onPurchase={handlePurchase}
        plans={CREDIT_PLANS}
      />
    </div>
  );
}
