import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/api';
import { Transaction } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { CalendarIcon, Download, PlusCircle } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { BulkSalesDialog } from '@/components/sales/BulkSalesDialog';
import { useToast } from '@/hooks/use-toast';

type FilterType = 'day' | 'month' | 'year' | 'custom';

export default function SalesPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterType>('day');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, isError } = useQuery<{ data: Transaction[], total: number }>({
    queryKey: ['transactions', page, filter, dateRange],
    queryFn: () => transactionService.getAll({
      page,
      limit: 10,
      filter,
      startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    }),
  });

  const transactions = data?.data || [];
  const totalPages = Math.ceil((data?.total || 0) / 10);

  const bulkCreateMutation = useMutation({
    mutationFn: transactionService.createBulk,
    onSuccess: () => {
      toast({ title: 'Bulk sales added successfully!' });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setBulkDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Failed to add bulk sales', description: error.message, variant: 'destructive' });
    },
  });

  const handleExport = async () => {
    try {
      await transactionService.export({
        filter,
        startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      });
    } catch (error) {
      console.error("Failed to export sales data:", error);
      // You might want to show a toast message here
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sales History</h1>
        <p className="text-muted-foreground">Browse and filter past transactions</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className='flex flex-wrap items-center gap-2'>
          <Button variant={filter === 'day' ? 'default' : 'outline'} onClick={() => { setFilter('day'); setPage(1); }}>Today</Button>
          <Button variant={filter === 'month' ? 'default' : 'outline'} onClick={() => { setFilter('month'); setPage(1); }}>This Month</Button>
          <Button variant={filter === 'year' ? 'default' : 'outline'} onClick={() => { setFilter('year'); setPage(1); }}>This Year</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={filter === 'custom' ? 'default' : 'outline'} className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {dateRange?.from && dateRange.to
                    ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                    : "Custom Range"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setFilter('custom');
                  setPage(1);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setBulkDialogOpen(true)} variant="outline" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Bulk Add
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Final Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={5} className="text-center text-destructive">Failed to load data</TableCell></TableRow>
            ) : transactions.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center h-24">No transactions found for this period.</TableCell></TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.transaction_id}>
                  <TableCell className="font-mono text-xs">{tx.transaction_id}</TableCell>
                  <TableCell>{tx.customer_name || 'N/A'}</TableCell>
                  <TableCell>{format(new Date(tx.transaction_date), 'PPpp')}</TableCell>
                  <TableCell className="capitalize">{tx.payment_method}</TableCell>
                  <TableCell className="text-right font-medium">₹{Number(tx.final_amount).toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="text-sm p-2">
              Page {page} of {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <BulkSalesDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onSubmit={bulkCreateMutation.mutate}
        isSubmitting={bulkCreateMutation.isPending}
      />
    </div>
  );
}