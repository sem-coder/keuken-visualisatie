import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type CheckboxProps = InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        'h-5 w-5 rounded border-stone-300 text-stone-900 focus:ring-stone-400',
        className,
      )}
      {...props}
    />
  ),
);
Checkbox.displayName = 'Checkbox';
