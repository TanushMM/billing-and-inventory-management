import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Inventory } from '@/types';
import { inventoryService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Pencil, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [formData, setFormData] = useState({
    inventory_id: '',
    stock_quantity: 0,
    min_stock_level: 0,
    batch_number: '',
    expiry_date: '',
  });
  const { toast } = useToast();

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (error) {
      toast({
        title: 'Error loading inventory',
        description: error instanceof Error ? error.message : 'Failed to load inventory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleEdit = (item: Inventory) => {
    setEditingItem(item);
    setFormData({
      inventory_id: item.inventory_id,
      stock_quantity: item.stock_quantity,
      min_stock_level: item.min_stock_level,
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date || '',
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      await inventoryService.update(editingItem.product_id, formData);
      toast({ title: 'Inventory updated successfully' });
      setEditDialogOpen(false);
      loadInventory();
    } catch (error) {
      toast({
        title: 'Error updating inventory',
        description: error instanceof Error ? error.message : 'Failed to update inventory',
        variant: 'destructive',
      });
    }
  };

  const isLowStock = (item: Inventory) => {
    return item.stock_quantity <= item.min_stock_level;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage stock levels</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock Quantity</TableHead>
              <TableHead>Min Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No inventory records found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => (
                <TableRow key={item.inventory_id}>
                  <TableCell className="font-medium">
                    {item.product?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {item.stock_quantity} {item.product?.unit?.unit_name}
                  </TableCell>
                  <TableCell>
                    {item.min_stock_level} {item.product?.unit?.unit_name}
                  </TableCell>
                  <TableCell>
                    {isLowStock(item) ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell>{item.batch_number || '-'}</TableCell>
                  <TableCell>{item.expiry_date || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory - {editingItem?.product?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min">Minimum Stock Level</Label>
              <Input
                id="min"
                type="number"
                step="0.01"
                value={formData.min_stock_level}
                onChange={(e) =>
                  setFormData({ ...formData, min_stock_level: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Number</Label>
              <Input
                id="batch"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
