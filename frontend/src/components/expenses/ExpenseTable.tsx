import { Expense } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, History } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewChangelog: (expenseId: string) => void;
}

export function ExpenseTable({ expenses, onEdit, onDelete, onViewChangelog }: ExpenseTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expenses found
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.expense_id}>
                <TableCell>{new Date(expense.expense_date).toLocaleDateString('en-IN')}</TableCell>
                <TableCell className="font-medium">{expense.description}</TableCell>
                <TableCell>{expense.category_name || 'N/A'}</TableCell>
                <TableCell>₹{Number(expense.amount).toFixed(2)}</TableCell>
                <TableCell className="max-w-xs truncate">{expense.notes || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewChangelog(expense.expense_id)}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(expense.expense_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
