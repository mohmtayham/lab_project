'use client';

import { forwardRef, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, className, id, ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <input ref={ref} id={id} className={cn('input', className)} {...props} />
  </div>
));
Input.displayName = 'Input';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, className, id, children, ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <select ref={ref} id={id} className={cn('input', className)} {...props}>
      {children}
    </select>
  </div>
));
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, className, id, ...props }, ref) => (
  <div>
    {label && <label htmlFor={id} className="label">{label}</label>}
    <textarea ref={ref} id={id} className={cn('input min-h-[90px] resize-y', className)} {...props} />
  </div>
));
Textarea.displayName = 'Textarea';
