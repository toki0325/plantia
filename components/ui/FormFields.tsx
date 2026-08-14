import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label.replace(/\s/g, "-");
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm text-[var(--color-text,#333333)]">
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full border border-[var(--color-border,#EAE6DD)] rounded-[2px] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary,#2F4B3C)] ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { label: string; value: string }[];
};

export function Select({ label, options, id, ...props }: SelectProps) {
  const selectId = id ?? label.replace(/\s/g, "-");
  return (
    <div className="space-y-1">
      <label htmlFor={selectId} className="block text-sm text-[var(--color-text,#333333)]">
        {label}
      </label>
      <select
        id={selectId}
        className="w-full border border-[var(--color-border,#EAE6DD)] rounded-[2px] px-3 py-2 text-sm bg-white focus:outline-none focus:border-[var(--color-primary,#2F4B3C)]"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

export function Textarea({ label, id, ...props }: TextareaProps) {
  const textareaId = id ?? label.replace(/\s/g, "-");
  return (
    <div className="space-y-1">
      <label htmlFor={textareaId} className="block text-sm text-[var(--color-text,#333333)]">
        {label}
      </label>
      <textarea
        id={textareaId}
        className="w-full border border-[var(--color-border,#EAE6DD)] rounded-[2px] px-3 py-2 text-sm min-h-[120px] focus:outline-none focus:border-[var(--color-primary,#2F4B3C)]"
        {...props}
      />
    </div>
  );
}
