/**
 * TAC Portal Component Template
 * 
 * Use this as a starting point for new components.
 * Copy and customize as needed.
 * 
 * @note This is a reference template - copy to components/ before use.
 */

import { forwardRef, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// 1. VARIANTS - Define visual variations
const componentVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// 2. TYPES - Props interface with documentation
export interface ComponentNameProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof componentVariants> {
  /** Primary content */
  children: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Callback when action is triggered */
  onAction?: () => void;
}

// 3. COMPONENT - Implementation with forwardRef
const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, variant, size, children, isLoading, disabled, onAction, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && !isLoading && onAction) {
        onAction();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-disabled={disabled || isLoading}
        role="button"
        tabIndex={disabled ? -1 : 0}
        {...props}
      >
        {isLoading ? (
          <span className="animate-spin mr-2" aria-hidden="true">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" strokeWidth="4" className="opacity-75" />
            </svg>
          </span>
        ) : null}
        {children}
      </div>
    );
  }
);

ComponentName.displayName = 'ComponentName';

// 4. MEMOIZED EXPORT - Prevent unnecessary re-renders
export default memo(ComponentName);

// 5. NAMED EXPORTS - For tree shaking
export { ComponentName, componentVariants };


// ============================================================
// DOMAIN COMPONENT TEMPLATE (Business Logic)
// ============================================================

/*
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InvoiceCardProps {
  invoiceId: string;
  onSelect?: (id: string) => void;
}

export function InvoiceCard({ invoiceId, onSelect }: InvoiceCardProps) {
  const queryClient = useQueryClient();

  // Server state
  const { data: invoice, isLoading, error } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => fetchInvoice(invoiceId),
  });

  // Mutations
  const { mutate: markPaid, isPending } = useMutation({
    mutationFn: () => updateInvoiceStatus(invoiceId, 'PAID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      toast.success('Invoice marked as paid');
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading invoice</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Success state
  return (
    <Card
      className="cursor-pointer hover:border-primary transition-colors"
      onClick={() => onSelect?.(invoiceId)}
    >
      <CardHeader>
        <CardTitle>{invoice.invoiceNumber}</CardTitle>
        <CardDescription>{invoice.customerName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <span>Amount</span>
          <span className="font-semibold">₹{invoice.total.toLocaleString()}</span>
        </div>
        <Badge variant={getStatusVariant(invoice.status)}>
          {invoice.status}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            markPaid();
          }}
          disabled={isPending || invoice.status === 'PAID'}
        >
          {isPending ? 'Processing...' : 'Mark as Paid'}
        </Button>
      </CardFooter>
    </Card>
  );
}
*/


// ============================================================
// FORM COMPONENT TEMPLATE
// ============================================================

/*
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  awb: z.string().regex(/^TAC\d{8}$/, 'Invalid AWB format'),
  customerName: z.string().min(2, 'Name too short'),
  amount: z.number().positive('Amount must be positive'),
});

type FormData = z.infer<typeof formSchema>;

export function InvoiceForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      awb: '',
      customerName: '',
      amount: 0,
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="awb"
        render={({ field }) => (
          <FormItem>
            <FormLabel>AWB Number</FormLabel>
            <FormControl>
              <Input placeholder="TAC00000000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Customer Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount (₹)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : 'Save Invoice'}
      </Button>
    </form>
  );
}
*/
