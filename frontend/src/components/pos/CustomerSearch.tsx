import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Customer } from '@/types';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerFormDialog } from '../customers/CustomerFormDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CustomerSearchProps {
  customers: Customer[];
  selectedCustomer: string;
  onSelectCustomer: (customerId: string) => void;
}

export function CustomerSearch({ customers, selectedCustomer, onSelectCustomer }: CustomerSearchProps) {
  const [open, setOpen] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

  const handlecustomerDialoClose = () => {
    setCustomerDialogOpen(false)
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedCustomer
              ? customers.find((customer) => customer.customer_id === selectedCustomer)?.name
              : 'Select customer...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder="Search customer by name, email, or phone..." />
            <CommandList>
              <CommandEmpty>No customer found.</CommandEmpty>
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.customer_id}
                    value={`${customer.name} ${customer.email} ${customer.phone}`}
                    onSelect={() => {
                      onSelectCustomer(customer.customer_id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCustomer === customer.customer_id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div>
                      <p>{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <Button variant="ghost" onClick={() => setCustomerDialogOpen(true)} className="w-full justify-start rounded-t-none">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Customer
            </Button>
          </Command>
        </PopoverContent>
      </Popover>
      <CustomerFormDialog
        open={customerDialogOpen}
        onOpenChange={handlecustomerDialoClose}
      />
    </>
  );
}