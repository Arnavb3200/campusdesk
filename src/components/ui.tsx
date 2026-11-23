import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Card({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div
      style={style}
      className={cn(
        'rounded-2xl border border-ink-100 bg-white shadow-card transition-shadow duration-200',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  children,
  type = 'button',
  disabled,
}: {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const styles = {
    primary:
      'bg-ink-900 text-white hover:bg-ink-950 focus-visible:ring-ink-900 shadow-soft disabled:bg-ink-300',
    secondary:
      'bg-white text-ink-800 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 focus-visible:ring-ink-400',
    ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-800',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-ink-100 bg-white shadow-card-hover animate-scale-in">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink-600">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10 transition-colors';

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon}
      </div>
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {hint && <p className="max-w-xs text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function ProgressBar({
  value,
  barClass,
  height = 'h-2',
}: {
  value: number;
  barClass?: string;
  height?: string;
}) {
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-ink-100', height)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', barClass ?? 'bg-ink-900')}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
