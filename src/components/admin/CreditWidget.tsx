
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreditBalance } from "@/types/credit";
import { getCreditBalance } from "@/utils/creditManager";

interface CreditWidgetProps {
  onBuyCredits?: () => void;
  showBuyButton?: boolean;
}

export function CreditWidget({ onBuyCredits, showBuyButton = true }: CreditWidgetProps) {
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  useEffect(() => {
    setBalance(getCreditBalance());
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setBalance(getCreditBalance());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!balance) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <div>
              <p className="text-sm text-blue-100">Available Credits</p>
              <p className="text-xl font-bold">{balance.availableCredits}</p>
            </div>
          </div>
          {showBuyButton && (
            <Button 
              onClick={onBuyCredits}
              size="sm" 
              variant="secondary"
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Buy</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
