import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost';
}

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-cyan-500 text-slate-950 hover:bg-cyan-400': variant === 'default',
          'bg-slate-800 text-slate-100 hover:bg-slate-700': variant === 'secondary',
          'bg-rose-500 text-white hover:bg-rose-400': variant === 'destructive',
          'bg-transparent text-slate-200 hover:bg-slate-800': variant === 'ghost'
        },
        className
      )}
      {...props}
    />
  );
}
