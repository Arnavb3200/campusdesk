export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function todayISO(): string {
  const d = new Date();
  return toISO(d);
}

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function parseISO(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function startOfToday(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function daysUntil(iso: string): number {
  return Math.round((parseISO(iso).getTime() - startOfToday()) / 86_400_000);
}

export function fmtDate(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function fmtDateLong(iso: string): string {
  return parseISO(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function fmtUploaded(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return 'Uploaded today';
  if (diff === -1) return 'Uploaded yesterday';
  if (diff > -7 && diff < 0) return `Uploaded ${-diff} days ago`;
  return `Uploaded ${fmtDate(iso)}`;
}

/** Rounds to 1 decimal place, e.g. 85.7 */
export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

/** How many classes (attended in a row) are needed to reach the target attendance. */
export function classesNeeded(attended: number, held: number, target = 0.75): number {
  if (held <= 0) return 0;
  if (pct(attended, held) >= target * 100) return 0;
  const n = Math.ceil((target * held - attended) / (1 - target));
  return Math.max(n, 0);
}

/** How many future classes can be skipped while staying above the target. */
export function skippable(attended: number, held: number, target = 0.75): number {
  if (held <= 0) return 0;
  if (pct(attended, held) < target * 100) return 0;
  const k = Math.floor((attended - target * held) / target);
  return Math.max(k, 0);
}

export function deadlineLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < -1) return `Overdue by ${-d} days`;
  if (d === -1) return 'Overdue by 1 day';
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  if (d <= 7) return `Due in ${d} days`;
  return `Due ${fmtDate(iso)}`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
