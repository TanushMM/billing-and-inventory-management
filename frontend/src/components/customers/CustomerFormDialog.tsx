import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/api';
import { Customer } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().optional(),
  phone_number: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export const CustomerFormDialog = ({
  open,
  onOpenChange,
  customer,
}: CustomerFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      email: '',
      address: '',
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        first_name: customer.first_name,
        last_name: customer.last_name || '',
        phone_number: customer.phone_number,
        email: customer.email || '',
        address: customer.address || '',
      });
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        address: '',
      });
    }
  }, [customer, form]);

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const customerData = {
        first_name: data.first_name,
        last_name: data.last_name || undefined,
        phone_number: data.phone_number,
        email: data.email || undefined,
        address: data.address || undefined,
      };
      if (customer) {
        return customerService.update(customer.customer_id, customerData);
      }
      return customerService.create(customerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: customer ? 'Customer updated successfully' : 'Customer created successfully',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Failed to save customer',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}