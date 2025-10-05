import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, customerService, transactionService } from '@/services/api';
import { Product, Customer, Transaction, TransactionItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, ShoppingCart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CartItemRow } from '@/components/pos/CartItemRow';
import { CartDiscountDialog } from '@/components/pos/CartDIscountDialog';

interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  item_total: number;
  discount_type: 'fixed' | 'percentage' | null;
  discount_value: number;
  final_item_total: number;
}

export default function POSPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [cartDiscountType, setCartDiscountType] = useState<'fixed' | 'percentage' | null>(null);
  const [cartDiscountValue, setCartDiscountValue] = useState<number>(0);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productService.getAll,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  });

  const createTransactionMutation = useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction completed successfully' });
      setCart([]);
      setSelectedCustomer('');
      setAmountPaid('');
    },
    onError: () => {
      toast({ title: 'Failed to complete transaction', variant: 'destructive' });
    },
  });

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    if (product.is_weighted) {
      setSelectedProduct(product);
      setWeightDialogOpen(true);
    } else {
      addToCart(product, 1);
    }
  };

  const handleWeightSubmit = () => {
    if (selectedProduct && weight) {
      const weightNum = parseFloat(weight);
      if (weightNum > 0) {
        addToCart(selectedProduct, weightNum);
        setWeightDialogOpen(false);
        setSelectedProduct(null);
        setWeight('');
      }
    }
  };

  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.product.product_id === product.product_id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      const itemTotal = newQuantity * existingItem.unit_price;
      const itemDiscount = existingItem.discount_type === 'fixed' 
        ? existingItem.discount_value 
        : existingItem.discount_type === 'percentage'
        ? (itemTotal * existingItem.discount_value) / 100
        : 0;
      
      setCart(cart.map(item =>
        item.product.product_id === product.product_id
          ? { 
              ...item, 
              quantity: newQuantity, 
              item_total: itemTotal,
              final_item_total: itemTotal - itemDiscount
            }
          : item
      ));
    } else {
      const itemTotal = quantity * product.selling_price;
      setCart([...cart, {
        product,
        quantity,
        unit_price: product.selling_price,
        item_total: itemTotal,
        discount_type: null,
        discount_value: 0,
        final_item_total: itemTotal,
      }]);
    }
    
    toast({ title: `Added ${product.name} to cart` });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart(cart.map(item => {
      if (item.product.product_id === productId) {
        const itemTotal = quantity * item.unit_price;
        const itemDiscount = item.discount_type === 'fixed' 
          ? item.discount_value 
          : item.discount_type === 'percentage'
          ? (itemTotal * item.discount_value) / 100
          : 0;
        return {
          ...item,
          quantity,
          item_total: itemTotal,
          final_item_total: itemTotal - itemDiscount
        };
      }
      return item;
    }));
  };

  const updateCartItemPrice = (productId: string, price: number) => {
    setCart(cart.map(item => {
      if (item.product.product_id === productId) {
        const itemTotal = item.quantity * price;
        const itemDiscount = item.discount_type === 'fixed' 
          ? item.discount_value 
          : item.discount_type === 'percentage'
          ? (itemTotal * item.discount_value) / 100
          : 0;
        return {
          ...item,
          unit_price: price,
          item_total: itemTotal,
          final_item_total: itemTotal - itemDiscount
        };
      }
      return item;
    }));
  };

  const updateCartItemDiscount = (productId: string, type: 'fixed' | 'percentage' | null, value: number) => {
    setCart(cart.map(item => {
      if (item.product.product_id === productId) {
        const itemDiscount = type === 'fixed' 
          ? value 
          : type === 'percentage'
          ? (item.item_total * value) / 100
          : 0;
        return {
          ...item,
          discount_type: type,
          discount_value: value,
          final_item_total: item.item_total - itemDiscount
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.product_id !== productId));
  };

  const calculateTotals = () => {
    // Sum of all item totals before any discounts
    const total_amount = cart.reduce((sum, item) => sum + item.item_total, 0);
    
    // Sum of all item-level discounts
    const itemDiscounts = cart.reduce((sum, item) => {
      const discount = item.discount_type === 'fixed' 
        ? item.discount_value 
        : item.discount_type === 'percentage'
        ? (item.item_total * item.discount_value) / 100
        : 0;
      return sum + discount;
    }, 0);
    
    // Calculate cart-level discount on subtotal after item discounts
    const subtotalAfterItemDiscounts = total_amount - itemDiscounts;
    const cartDiscount = cartDiscountType === 'fixed' 
      ? cartDiscountValue 
      : cartDiscountType === 'percentage'
      ? (subtotalAfterItemDiscounts * cartDiscountValue) / 100
      : 0;
    
    const total_discount = itemDiscounts + cartDiscount;
    const final_amount = total_amount - total_discount;
    
    return { total_amount, total_discount, final_amount, subtotalAfterItemDiscounts };
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    const { total_amount, total_discount, final_amount } = calculateTotals();
    const paid = parseFloat(amountPaid) || 0;
    const change_due = paymentMethod === 'cash' ? Math.max(0, paid - final_amount) : 0;
    const customer_credit = paymentMethod === 'credit' ? final_amount : 0;

    const transactionItems: Omit<TransactionItem, 'transaction_item_id' | 'transaction_id'>[] = cart.map(item => {
      const itemDiscount = item.discount_type === 'fixed' 
        ? item.discount_value 
        : item.discount_type === 'percentage'
        ? (item.item_total * item.discount_value) / 100
        : 0;
      
      return {
        product_id: item.product.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        item_total: item.item_total,
        item_discount: itemDiscount,
        tax_rate: item.product.category?.gst_rate || 0,
      };
    });

    const transaction: Omit<Transaction, 'transaction_id' | 'transaction_date'> = {
      customer_id: selectedCustomer || undefined,
      total_amount,
      total_discount,
      final_amount,
      payment_method: paymentMethod,
      change_due,
      customer_credit,
      is_reprinted: false,
      items: transactionItems as TransactionItem[],
    };

    createTransactionMutation.mutate(transaction);
  };

  const { total_amount, total_discount, final_amount, subtotalAfterItemDiscounts } = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Search */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="border rounded-lg max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>{product.product_id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>₹{product.selling_price}</TableCell>
                    <TableCell>
                      {product.unit_name}
                      {product.is_weighted && ' (weighted)'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleAddProduct(product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </h2>

            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {cart.map((item) => (
                <CartItemRow
                  key={item.product.product_id}
                  productId={item.product.product_id}
                  product={item.product}
                  quantity={item.quantity}
                  unitPrice={item.unit_price}
                  discountType={item.discount_type}
                  discountValue={item.discount_value}
                  onQuantityChange={updateCartItemQuantity}
                  onPriceChange={updateCartItemPrice}
                  onDiscountChange={updateCartItemDiscount}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {cart.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            )}

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount:</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-green-600">₹{total_discount.toFixed(2)}</span>
                  <CartDiscountDialog
                    discountType={cartDiscountType}
                    discountValue={cartDiscountValue}
                    onDiscountChange={(type, value) => {
                      setCartDiscountType(type);
                      setCartDiscountValue(value);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₹{final_amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <Label>Customer (Optional)</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customer_id} value={customer.customer_id.toString()}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'upi' | 'credit')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <Label>Amount Paid</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0.00"
                  />
                  {amountPaid && parseFloat(amountPaid) >= final_amount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Change: ₹{(parseFloat(amountPaid) - final_amount).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cart.length === 0 || createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? 'Processing...' : 'Complete Transaction'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Dialog */}
      <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Weight for {selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Weight ({selectedProduct?.unit_name})</Label>
              <Input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
            </div>
            {weight && selectedProduct && (
              <p className="text-sm">
                Total: ₹{(parseFloat(weight) * selectedProduct.selling_price).toFixed(2)}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWeightDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWeightSubmit}>
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
