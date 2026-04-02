import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useThemeContext } from '../../context/ThemeContext';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', style, ...props }, ref) => {
    const { currentTheme } = useThemeContext();
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      default: '', // Dynamic style applied below
      outline: 'border-2 bg-transparent', // Dynamic borders applied below
      ghost: 'hover:bg-neutral-100 text-neutral-900',
      destructive: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
      sm: 'h-7 px-3 text-xs',
      default: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    // Brand theme styling (Orange)
    const brandPrimary = currentTheme.primary[2] || '#F57C00';
    
    const dynamicStyles = variant === 'default' 
      ? { backgroundColor: brandPrimary, color: 'white' } 
      : variant === 'outline' 
        ? { borderColor: brandPrimary, color: brandPrimary } 
        : {};

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={{ ...dynamicStyles, ...style }}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;


