import { useState, useEffect } from 'react';
import { Product, Unit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WeightInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  units: Unit[];
  onAddToCart: (quantity: number) => void;
}

export function WeightInputDialog({
  open,
  onOpenChange,
  product,
  units,
  onAddToCart,
}: WeightInputDialogProps) {
  const [weight, setWeight] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  useEffect(() => {
    if (product) {
      setSelectedUnitId(product.unit_id);
    }
    // Reset weight when dialog is opened/closed or product changes
    setWeight('');
  }, [open, product]);

  const handleSubmit = () => {
    const enteredWeight = parseFloat(weight);
    if (!product || isNaN(enteredWeight) || enteredWeight <= 0) return;

    const baseUnit = units.find(u => u.unit_id === product.unit_id);
    const selectedUnit = units.find(u => u.unit_id === selectedUnitId);

    if (!baseUnit || !selectedUnit) return;

    // Convert the entered weight to the product's base unit quantity
    // Assumes conversion_factor is how many of a unit make up a base unit (e.g., Grams = 1000 for a KG base)
    const quantityInBaseUnit = enteredWeight / (selectedUnit.conversion_factor / baseUnit.conversion_factor);

    onAddToCart(quantityInBaseUnit);
    onOpenChange(false);
  };

  const selectedUnit = units.find(u => u.unit_id === selectedUnitId);
  const total = product && weight ? parseFloat(weight) * (Number(product.selling_price) / (selectedUnit?.conversion_factor || 1)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Weight for {product?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {/* Suggesting only units with the same base for simplicity, you can expand this logic */}
                  {units.map((unit) => (
                    <SelectItem key={unit.unit_id} value={unit.unit_id}>
                      {unit.unit_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {weight && product && (
            <p className="text-sm text-muted-foreground">
              Calculated Total: ₹{total.toFixed(2)}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}