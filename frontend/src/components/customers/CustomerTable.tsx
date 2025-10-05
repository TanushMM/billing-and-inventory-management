import { Customer } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export const CustomerTable = ({
  customers,
  isLoading,
  onEdit,
  onDelete,
}: CustomerTableProps) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading customers...</div>;
  }

  if (customers.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No customers found</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.customer_id}>
              <TableCell>{customer.customer_id}</TableCell>
              <TableCell>
                {customer.name}
              </TableCell>
              <TableCell>{customer.phone}</TableCell>
              <TableCell>{customer.email || '-'}</TableCell>
              <TableCell>{customer.address || '-'}</TableCell>
              <TableCell>{new Date(customer.created_at).toLocaleDateString('en-GB') || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(customer)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(customer.customer_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}