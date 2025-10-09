import { ExpenseChangeLog } from '@/types';
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

interface ExpenseChangeLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeLogs: ExpenseChangeLog[];
  loading: boolean;
}

export function ExpenseChangeLogDialog({
  open,
  onOpenChange,
  changeLogs,
  loading,
}: ExpenseChangeLogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Expense Change History</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : changeLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No changes recorded</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Old Value</TableHead>
                  <TableHead>New Value</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changeLogs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell>
                      {new Date(log.changed_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.field_name}</TableCell>
                    <TableCell className="text-muted-foreground">{log.old_value}</TableCell>
                    <TableCell>{log.new_value}</TableCell>
                    <TableCell>{log.changed_by}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
