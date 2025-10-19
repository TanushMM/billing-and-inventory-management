import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExpenseCategory } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface ConfigureExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  onAdd: (category: Omit<ExpenseCategory, 'category_id'>) => void;
  onUpdate: (id: string, category: Partial<ExpenseCategory>) => void;
  onDelete: (id: string) => void;
}

export function ConfigureExpenseDialog({
  open,
  onOpenChange,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: ConfigureExpenseDialogProps) {
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingCategory(null);
      setCategoryName('');
    }
  }, [open]);

  const handleSave = () => {
    if (!categoryName) return;

    if (editingCategory) {
      onUpdate(editingCategory.category_id, { category_name: categoryName });
    } else {
      onAdd({ category_name: categoryName });
    }
    setCategoryName('');
    setEditingCategory(null);
  };

  const startEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setCategoryName(category.category_name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Expense Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Utilities"
                />
              </div>
              <Button onClick={handleSave} disabled={!categoryName}>
                <Plus className="h-4 w-4 mr-2" />
                {editingCategory ? 'Update' : 'Add'}
              </Button>
              {editingCategory && (
                <Button variant="outline" onClick={() => { setEditingCategory(null); setCategoryName(''); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <div className="border rounded-lg max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.category_id}>
                    <TableCell>{category.category_name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(category)} className="mr-2">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(category.category_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}