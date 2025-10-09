import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService, expenseCategoryService } from '@/services/api';
import { Expense, ExpenseChangeLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download, Search } from 'lucide-react';
import { ExpenseTable } from '@/components/expenses/ExpenseTable';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';
import { ExpenseChangeLogDialog } from '@/components/expenses/ExpenseChangeLogDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export default function ExpensesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changeLogDialogOpen, setChangeLogDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>('');
  const [changeLogs, setChangeLogs] = useState<ExpenseChangeLog[]>([]);
  const [changeLogLoading, setChangeLogLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'day' | 'week' | 'month' | 'custom' | 'all'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: expenseCategoryService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create expense', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update expense', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Expense deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete expense', variant: 'destructive' });
    },
  });

  const handleViewChangelog = async (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setChangeLogDialogOpen(true);
    setChangeLogLoading(true);
    try {
      const logs = await expenseService.getChangeLogs(expenseId);
      setChangeLogs(logs);
    } catch (error) {
      toast({ title: 'Failed to load change logs', variant: 'destructive' });
    } finally {
      setChangeLogLoading(false);
    }
  };

  const handleSubmit = (data: Partial<Expense>) => {
    if (selectedExpense) {
      updateMutation.mutate({ id: selectedExpense.expense_id, data });
    } else {
      createMutation.mutate(data as Omit<Expense, 'expense_id' | 'created_at'>);
    }
    setSelectedExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExportCSV = () => {
    const csvData = filteredExpenses.map(expense => ({
      Date: new Date(expense.expense_date).toLocaleDateString(),
      Description: expense.description,
      Category: expense.category?.category_name || 'N/A',
      Amount: expense.amount,
      Notes: expense.notes || '',
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).map(val => `"${val}"`).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter expenses based on date filter
  const getFilteredByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.expense_date);
      
      switch (dateFilter) {
        case 'day':
          return expenseDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return expenseDate >= monthAgo;
        case 'custom':
          if (!customDateFrom || !customDateTo) return true;
          const from = new Date(customDateFrom);
          const to = new Date(customDateTo);
          return expenseDate >= from && expenseDate <= to;
        default:
          return true;
      }
    });
  };

  const filteredExpenses = getFilteredByDate().filter(expense =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.category?.category_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={filteredExpenses.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => { setSelectedExpense(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="date"
              value={customDateFrom}
              onChange={(e) => setCustomDateFrom(e.target.value)}
              placeholder="From"
            />
          </div>
          <div className="flex-1">
            <Input
              type="date"
              value={customDateTo}
              onChange={(e) => setCustomDateTo(e.target.value)}
              placeholder="To"
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <ExpenseTable
            expenses={paginatedExpenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewChangelog={handleViewChangelog}
          />

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <ExpenseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        expense={selectedExpense}
        categories={categories}
        onSubmit={handleSubmit}
      />

      <ExpenseChangeLogDialog
        open={changeLogDialogOpen}
        onOpenChange={setChangeLogDialogOpen}
        changeLogs={changeLogs}
        loading={changeLogLoading}
      />
    </div>
  );
}
