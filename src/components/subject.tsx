import { SUBJECT_COLORS, type SubjectColorKey } from './colors';
import { cn } from '@/lib/utils';

export function SubjectChip({
  name,
  code,
  color,
  size = 'md',
}: {
  name: string;
  code?: string;
  color: string;
  size?: 'sm' | 'md';
}) {
  const c = SUBJECT_COLORS[color as SubjectColorKey] ?? SUBJECT_COLORS.ink;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset',
        c.chip,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
    >
      <span className={cn('rounded-full', c.dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      {code ? `${code}` : name}
      {code && <span className="hidden font-medium opacity-70 sm:inline">{name}</span>}
    </span>
  );
}

export function SubjectSelect({
  subjects,
  value,
  onChange,
  className,
}: {
  subjects: { id: string; name: string; code: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/10',
        className,
      )}
    >
      <option value="">Select subject</option>
      {subjects.map((s) => (
        <option key={s.id} value={s.id}>
          {s.code} — {s.name}
        </option>
      ))}
    </select>
  );
}
