import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Percent, IndianRupee, Tag } from 'lucide-react';

interface CartDiscountDialogProps {
  discountType: 'fixed' | 'percentage' | null;
  discountValue: number;
  onDiscountChange: (type: 'fixed' | 'percentage' | null, value: number) => void;
}

export function CartDiscountDialog({
  discountType,
  discountValue,
  onDiscountChange,
}: CartDiscountDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputType, setInputType] = useState<'fixed' | 'percentage'>(discountType || 'percentage');
  const [inputValue, setInputValue] = useState(discountValue.toString());

  const handleApply = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value) && value >= 0) {
      onDiscountChange(inputType, value);
      setOpen(false);
    }
  };

  const handleRemove = () => {
    onDiscountChange(null, 0);
    setInputValue('0');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="h-4 w-4" />
          {discountType ? 'Edit Discount' : 'Add Discount'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cart Discount</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup value={inputType} onValueChange={(v) => setInputType(v as 'fixed' | 'percentage')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="percentage" id="cart-percentage" />
              <Label htmlFor="cart-percentage" className="flex items-center gap-1">
                <Percent className="h-4 w-4" />
                Percentage Discount
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="fixed" id="cart-fixed" />
              <Label htmlFor="cart-fixed" className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                Fixed Amount Discount
              </Label>
            </div>
          </RadioGroup>

          <div>
            <Label>Discount Value</Label>
            <Input
              type="number"
              step="0.01"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputType === 'percentage' ? '0-100' : '0.00'}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Discount
            </Button>
            {discountType && (
              <Button variant="outline" onClick={handleRemove} className="flex-1">
                Remove Discount
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
