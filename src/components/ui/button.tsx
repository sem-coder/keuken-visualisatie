import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[48px] px-5 text-sm',
  {
    variants: {
      variant: {
        primary: 'bg-stone-900 text-white hover:bg-stone-800',
        secondary: 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-50',
        ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
        destructive: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
      },
      size: {
        default: 'min-h-[48px] px-5',
        sm: 'min-h-[40px] px-4 text-sm',
        lg: 'min-h-[52px] px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
