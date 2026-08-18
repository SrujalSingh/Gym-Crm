'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// BUTTON
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', icon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';
    
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs focus:ring-indigo-500',
      secondary: 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200/80 shadow-2xs focus:ring-slate-400',
      outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400 bg-white',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs focus:ring-rose-500',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs focus:ring-emerald-500',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400',
    };

    const sizes = {
      sm: 'px-3.5 py-2 text-xs gap-1.5',
      md: 'px-4.5 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-sm font-semibold gap-2.5',
    };

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// INPUT
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-2xs',
            error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// SELECT
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-white border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all cursor-pointer shadow-2xs',
            error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// CARD
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow', className)}>
      {children}
    </div>
  );
}

// BADGE
export interface BadgeProps {
  variant?: 'emerald' | 'amber' | 'rose' | 'zinc' | 'sky' | 'indigo' | 'blue';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'zinc', children, className }: BadgeProps) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 font-medium',
    zinc: 'bg-slate-100 text-slate-700 border-slate-200 font-medium',
    sky: 'bg-sky-50 text-sky-700 border-sky-200 font-medium',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
  };

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border', styles[variant], className)}>
      {children}
    </span>
  );
}

// MODAL
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'md' }: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const modalContent = (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[85vh] relative z-[10000]',
          widthClasses[maxWidth]
        )}
      >
        {/* Sticky Header with Prominent Close Button */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
          <div className="pr-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors font-bold text-sm shrink-0 cursor-pointer shadow-2xs border border-slate-200/80"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// SWITCH TOGGLE
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-2">
      {(label || description) && (
        <div className="pr-4">
          {label && <span className="text-sm font-medium text-slate-800 block">{label}</span>}
          {description && <span className="text-xs text-slate-500 block">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          checked ? 'bg-emerald-600' : 'bg-slate-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </label>
  );
}
