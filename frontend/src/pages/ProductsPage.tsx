import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { ConfigureDialog } from '@/components/products/ConfigureDialog';
import { Product, Category, Unit } from '@/types';
import { productService, categoryService, unitService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, unitsData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        unitService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setUnits(unitsData);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: error instanceof Error ? error.message : 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(productId);
      toast({ title: 'Product deleted successfully' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error deleting product',
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct.product_id, productData);
        toast({ title: 'Product updated successfully' });
      } else {
        await productService.create(productData as Omit<Product, 'product_id' | 'created_at'>);
        toast({ title: 'Product added successfully' });
      }
      setProductDialogOpen(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error saving product',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'category_id'>) => {
    try {
      await categoryService.create(category);
      toast({ title: 'Category added successfully' });
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error adding category',
        description: error instanceof Error ? error.message : 'Failed to add category',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCategory = async (id: number, category: Partial<Category>) => {
    try {
      await categoryService.update(id, category);
      toast({ title: 'Category updated successfully' });
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error updating category',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      toast({ title: 'Category deleted successfully' });
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: 'Error deleting category',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      });
    }
  };

  const handleAddUnit = async (unit: Omit<Unit, 'unit_id'>) => {
    try {
      await unitService.create(unit);
      toast({ title: 'Unit added successfully' });
      const unitsData = await unitService.getAll();
      setUnits(unitsData);
    } catch (error) {
      toast({
        title: 'Error adding unit',
        description: error instanceof Error ? error.message : 'Failed to add unit',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUnit = async (id: number, unit: Partial<Unit>) => {
    try {
      await unitService.update(id, unit);
      toast({ title: 'Unit updated successfully' });
      const unitsData = await unitService.getAll();
      setUnits(unitsData);
    } catch (error) {
      toast({
        title: 'Error updating unit',
        description: error instanceof Error ? error.message : 'Failed to update unit',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;
    try {
      await unitService.delete(id);
      toast({ title: 'Unit deleted successfully' });
      const unitsData = await unitService.getAll();
      setUnits(unitsData);
    } catch (error) {
      toast({
        title: 'Error deleting unit',
        description: error instanceof Error ? error.message : 'Failed to delete unit',
        variant: 'destructive',
      });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setConfigureDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configure Categories & Units
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <ProductTable
        products={products}
        categories={categories}
        units={units}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <ProductFormDialog
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        onSubmit={handleSubmitProduct}
        product={editingProduct}
        categories={categories}
        units={units}
      />

      <ConfigureDialog
        open={configureDialogOpen}
        onClose={() => setConfigureDialogOpen(false)}
        categories={categories}
        units={units}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddUnit={handleAddUnit}
        onUpdateUnit={handleUpdateUnit}
        onDeleteUnit={handleDeleteUnit}
      />
    </div>
  );
};

export default ProductsPage;
