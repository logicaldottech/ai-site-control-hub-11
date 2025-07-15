
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ArrowUpCircle, ArrowDownCircle, Gift, CreditCard } from "lucide-react";
import { CreditTransaction } from "@/types/credit";

interface CreditTransactionHistoryProps {
  transactions: CreditTransaction[];
  onRefresh: () => void;
}

export function CreditTransactionHistory({ transactions, onRefresh }: CreditTransactionHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'usage':
        return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'refund':
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      default:
        return <ArrowUpCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'usage':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case 'bonus':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'refund':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = amount > 0 ? '+' : '';
    return `${prefix}${amount}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions yet
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.createdAt.toLocaleDateString()} at {transaction.createdAt.toLocaleTimeString()}
                    </p>
                    {transaction.metadata?.service && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Service: {transaction.metadata.service}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                  <Badge className={getTransactionColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
            {transactions.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline">View All Transactions</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
