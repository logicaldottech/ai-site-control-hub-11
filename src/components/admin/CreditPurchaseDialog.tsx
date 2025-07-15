
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditPlan } from "@/types/credit";

interface CreditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (planId: string) => void;
  plans: CreditPlan[];
}

export function CreditPurchaseDialog({ isOpen, onClose, onPurchase, plans }: CreditPurchaseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Purchase Credits</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {plans.map((plan) => (
            <div key={plan.id} className={`p-6 border rounded-lg relative ${plan.popular ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 left-4 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <div className="text-center">
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {plan.credits}
                  {plan.bonus && <span className="text-lg text-green-600">+{plan.bonus}</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">credits</p>
                <p className="text-3xl font-bold mb-3">${plan.price}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                <Button 
                  onClick={() => onPurchase(plan.id)}
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Purchase Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
