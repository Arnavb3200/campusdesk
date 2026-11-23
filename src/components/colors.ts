export const SUBJECT_COLORS = {
  teal: { chip: 'bg-teal-500/10 text-teal-700 ring-teal-500/20', bar: 'bg-teal-500', dot: 'bg-teal-500', stroke: '#14b8a6' },
  sky: { chip: 'bg-sky-500/10 text-sky-700 ring-sky-500/20', bar: 'bg-sky-500', dot: 'bg-sky-500', stroke: '#0ea5e9' },
  amber: { chip: 'bg-amber-500/10 text-amber-700 ring-amber-500/20', bar: 'bg-amber-500', dot: 'bg-amber-500', stroke: '#f59e0b' },
  violet: { chip: 'bg-violet-500/10 text-violet-700 ring-violet-500/20', bar: 'bg-violet-500', dot: 'bg-violet-500', stroke: '#8b5cf6' },
  rose: { chip: 'bg-rose-500/10 text-rose-700 ring-rose-500/20', bar: 'bg-rose-500', dot: 'bg-rose-500', stroke: '#f43f5e' },
  emerald: { chip: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20', bar: 'bg-emerald-500', dot: 'bg-emerald-500', stroke: '#10b981' },
  ink: { chip: 'bg-ink-500/10 text-ink-700 ring-ink-500/20', bar: 'bg-ink-500', dot: 'bg-ink-500', stroke: '#5b78a0' },
} as const;

export type SubjectColorKey = keyof typeof SUBJECT_COLORS;

export const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-rose-50 text-rose-700 ring-rose-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-sky-50 text-sky-700 ring-sky-200',
};
