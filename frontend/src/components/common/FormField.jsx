import React from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  icon: Icon,
  as = 'input',
  rows = 3,
  options = [],
  children,
}) => {
  const hasError = Boolean(error);

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {helperText && !hasError && (
            <span className="text-xs text-slate-400 font-normal">{helperText}</span>
          )}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        {as === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            className={`block w-full rounded-lg border bg-white py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10 pr-8' : 'px-3.5'
            } ${
              hasError
                ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-400'
            } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
            {children}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full rounded-lg border bg-white py-2 px-3.5 text-sm transition-all focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-400'
            } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full rounded-lg border bg-white py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
              Icon ? 'pl-10' : 'px-3.5'
            } ${
              hasError
                ? 'border-red-300 text-red-900 pr-10 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-100 hover:border-slate-400'
            } ${disabled ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
          />
        )}

        {hasError && as !== 'select' && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>

      {hasError && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium animate-fadeIn">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
