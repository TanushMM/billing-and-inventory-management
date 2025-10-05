import { useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, Percent, IndianRupee, Tag } from 'lucide-react';

interface CartItemRowProps {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountType: 'fixed' | 'percentage' | null;
  discountValue: number;
  onQuantityChange: (productId: string, quantity: number) => void;
  onPriceChange: (productId: string, price: number) => void;
  onDiscountChange: (productId: string, type: 'fixed' | 'percentage' | null, value: number) => void;
  onRemove: (productId: string) => void;
}

export function CartItemRow({
  productId,
  product,
  quantity,
  unitPrice,
  discountType,
  discountValue,
  onQuantityChange,
  onPriceChange,
  onDiscountChange,
  onRemove,
}: CartItemRowProps) {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(unitPrice.toString());
  const [discountInputType, setDiscountInputType] = useState<'fixed' | 'percentage'>(discountType || 'percentage');
  const [discountInputValue, setDiscountInputValue] = useState(discountValue.toString());

  // const itemTotal = quantity * unitPrice;
  const numericUnitPrice = Number(unitPrice);
  const itemTotal = quantity * numericUnitPrice;
  
  const calculateDiscount = () => {
    if (!discountType || discountValue === 0) return 0;
    // if (discountType === 'fixed') return discountValue;
    // return (itemTotal * discountValue) / 100;
    if (discountType === 'fixed') return Number(discountValue);
    return (itemTotal * Number(discountValue)) / 100;
  };

  const itemDiscount = calculateDiscount();
  const finalItemTotal = itemTotal - itemDiscount;

  const handlePriceBlur = () => {
    const newPrice = parseFloat(tempPrice);
    // if (!isNaN(newPrice) && newPrice > 0 && newPrice <= product.mrp) {
    if (!isNaN(newPrice) && newPrice > 0 && newPrice <= Number(product.mrp)) {
      onPriceChange(productId, newPrice);
    } else {
      setTempPrice(unitPrice.toString());
    }
    setIsEditingPrice(false);
  };

  const handleApplyDiscount = () => {
    const value = parseFloat(discountInputValue);
    if (!isNaN(value) && value >= 0) {
      onDiscountChange(productId, discountInputType, value);
    }
  };

  const handleRemoveDiscount = () => {
    onDiscountChange(productId, null, 0);
    setDiscountInputValue('0');
  };

  return (
    <div className="p-3 bg-muted/50 rounded-lg border">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="font-medium">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            MRP: ₹{product.mrp} | Unit: {product.unit_name}
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove(productId)}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <Label className="text-xs">Quantity</Label>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuantityChange(productId, Math.max(0.01, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val > 0) {
                  onQuantityChange(productId, val);
                }
              }}
              className="h-8 text-center"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => onQuantityChange(productId, quantity + 1)}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs">Unit Price</Label>
          {isEditingPrice ? (
            <Input
              type="number"
              step="0.01"
              value={tempPrice}
              onChange={(e) => setTempPrice(e.target.value)}
              onBlur={handlePriceBlur}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
              autoFocus
              className="h-8"
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditingPrice(true)}
              className="h-8 w-full justify-start font-mono"
            >
              ₹{numericUnitPrice.toFixed(2)}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t">
        <div className="flex justify-between text-sm">
          <span>Item Total:</span>
          <span className="font-medium">₹{itemTotal.toFixed(2)}</span>
        </div>

        {itemDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>-₹{itemDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-semibold">Final:</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold">₹{finalItemTotal.toFixed(2)}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2">
                  <Tag className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold">Item Discount</h4>
                  
                  <RadioGroup value={discountInputType} onValueChange={(v) => setDiscountInputType(v as 'fixed' | 'percentage')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id={`${productId}-percentage`} />
                      <Label htmlFor={`${productId}-percentage`} className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Percentage
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id={`${productId}-fixed`} />
                      <Label htmlFor={`${productId}-fixed`} className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        Fixed Amount
                      </Label>
                    </div>
                  </RadioGroup>

                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discountInputValue}
                      onChange={(e) => setDiscountInputValue(e.target.value)}
                      placeholder={discountInputType === 'percentage' ? '0-100' : '0.00'}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleApplyDiscount} className="flex-1">
                      Apply
                    </Button>
                    {discountType && (
                      <Button variant="outline" onClick={handleRemoveDiscount} className="flex-1">
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
}
