import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/api';
import { Customer } from '@/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download } from 'lucide-react';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { CustomerFormDialog } from '@/components/customers/CustomerFormDialog';

export default function CustomersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: 'Customer deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete customer', variant: 'destructive' });
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Phone', 'Email', 'Address', 'Created At'];
    const rows = customers.map(c => [
      c.customer_id,
      c.first_name,
      c.last_name || '',
      c.phone_number,
      c.email || '',
      c.address || '',
      new Date(c.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({ title: 'Customer data exported successfully' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CustomerFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        customer={selectedCustomer}
      />
    </div>
  );
}