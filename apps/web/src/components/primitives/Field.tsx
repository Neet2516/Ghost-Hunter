import React from 'react';
import { cn } from '@/lib/utils';

export interface FieldBaseProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FieldBaseProps {
  as?: 'input';
}

export interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    FieldBaseProps {
  as: 'textarea';
}

export interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    FieldBaseProps {
  as: 'select';
  options?: Array<{ label: string; value: string | number }>;
}

export type FieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps;

export function Field(props: FieldProps) {
  const { label, error, hint, required, className, id, ...rest } = props;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="font-mono text-xs uppercase tracking-wider text-ash font-medium flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-signal">*</span>}
          </span>
          {hint && <span className="text-[10px] text-ash/80 lowercase">{hint}</span>}
        </label>
      )}

      {props.as === 'textarea' ? (
        <textarea
          id={inputId}
          className={cn(
            'input-editorial min-h-[90px] resize-y font-sans text-base',
            error && 'border-b-status-failed focus:border-b-status-failed',
            className
          )}
          aria-invalid={!!error}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : props.as === 'select' ? (
        <select
          id={inputId}
          className={cn(
            'input-editorial bg-transparent cursor-pointer font-sans text-base',
            error && 'border-b-status-failed focus:border-b-status-failed',
            className
          )}
          aria-invalid={!!error}
          {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {props.options
            ? props.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-paper text-ink">
                  {opt.label}
                </option>
              ))
            : props.children}
        </select>
      ) : (
        <input
          id={inputId}
          className={cn(
            'input-editorial font-sans text-base',
            error && 'border-b-status-failed focus:border-b-status-failed',
            className
          )}
          aria-invalid={!!error}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <span className="font-mono text-xs text-status-failed tracking-tight">
          {error}
        </span>
      )}
    </div>
  );
}
