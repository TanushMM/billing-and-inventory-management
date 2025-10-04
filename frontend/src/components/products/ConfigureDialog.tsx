import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Category, Unit } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface ConfigureDialogProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  units: Unit[];
  onAddCategory: (category: Omit<Category, 'category_id'>) => void;
  onUpdateCategory: (id: number, category: Partial<Category>) => void;
  onDeleteCategory: (id: number) => void;
  onAddUnit: (unit: Omit<Unit, 'unit_id'>) => void;
  onUpdateUnit: (id: number, unit: Partial<Unit>) => void;
  onDeleteUnit: (id: number) => void;
}

export const ConfigureDialog = ({
  open,
  onClose,
  categories,
  units,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
}: ConfigureDialogProps) => {
  const [categoryName, setCategoryName] = useState('');
  const [gstRate, setGstRate] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [unitName, setUnitName] = useState('');
  const [conversionFactor, setConversionFactor] = useState('');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const handleAddCategory = () => {
    if (!categoryName || !gstRate) return;
    onAddCategory({ name: categoryName, gst_rate: parseFloat(gstRate) });
    setCategoryName('');
    setGstRate('');
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !categoryName || !gstRate) return;
    onUpdateCategory(editingCategory.category_id, {
      name: categoryName,
      gst_rate: parseFloat(gstRate),
    });
    setEditingCategory(null);
    setCategoryName('');
    setGstRate('');
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setGstRate(category.gst_rate.toString());
  };

  const handleAddUnit = () => {
    if (!unitName || !conversionFactor) return;
    onAddUnit({ unit_name: unitName, conversion_factor: parseFloat(conversionFactor) });
    setUnitName('');
    setConversionFactor('');
  };

  const handleUpdateUnit = () => {
    if (!editingUnit || !unitName || !conversionFactor) return;
    onUpdateUnit(editingUnit.unit_id, {
      unit_name: unitName,
      conversion_factor: parseFloat(conversionFactor),
    });
    setEditingUnit(null);
    setUnitName('');
    setConversionFactor('');
  };

  const startEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setUnitName(unit.unit_name);
    setConversionFactor(unit.conversion_factor.toString());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Categories & Units</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Category Name</Label>
                  <Input
                    id="cat-name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g., Groceries"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Rate (%)</Label>
                  <Input
                    id="gst"
                    type="number"
                    step="0.01"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                  disabled={!categoryName || !gstRate}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Update' : 'Add'} Category
                </Button>
                {editingCategory && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryName('');
                      setGstRate('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>GST Rate (%)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.category_id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.gst_rate}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditCategory(category)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteCategory(category.category_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="units" className="space-y-4">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">{editingUnit ? 'Edit Unit' : 'Add New Unit'}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit-name">Unit Name</Label>
                  <Input
                    id="unit-name"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="e.g., kg, liter, piece"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conversion">Conversion Factor</Label>
                  <Input
                    id="conversion"
                    type="number"
                    step="0.0001"
                    value={conversionFactor}
                    onChange={(e) => setConversionFactor(e.target.value)}
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={editingUnit ? handleUpdateUnit : handleAddUnit}
                  disabled={!unitName || !conversionFactor}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingUnit ? 'Update' : 'Add'} Unit
                </Button>
                {editingUnit && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUnit(null);
                      setUnitName('');
                      setConversionFactor('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit Name</TableHead>
                    <TableHead>Conversion Factor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {units.map((unit) => (
                    <TableRow key={unit.unit_id}>
                      <TableCell>{unit.unit_name}</TableCell>
                      <TableCell>{unit.conversion_factor}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditUnit(unit)}
                          className="mr-2"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteUnit(unit.unit_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
