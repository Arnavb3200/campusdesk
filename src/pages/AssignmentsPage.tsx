import { useMemo, useState } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Clock,
  CalendarDays,
  AlertTriangle,
  Search,
  ListFilter,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, Modal, Field, inputCls, EmptyState } from '@/components/ui';
import { SubjectChip } from '@/components/subject';
import { PRIORITY_STYLES } from '@/components/colors';
import { useStore } from '@/lib/store';
import type { Assignment, Priority } from '@/lib/types';
import { cn, fmtDate, deadlineLabel, daysUntil, todayISO } from '@/lib/utils';

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
type Filter = 'all' | 'pending' | 'completed' | 'overdue';
type SortKey = 'deadline' | 'priority' | 'subject';

const PRIORITY_RANK: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function AssignmentsPage() {
  const { data, subjects, addAssignment, toggleAssignment, deleteAssignment } = useStore();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('deadline');
  const today = todayISO();

  // form state
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [notes, setNotes] = useState('');

  const filtered = useMemo(() => {
    let list = data.assignments.filter((a) =>
      a.title.toLowerCase().includes(query.toLowerCase()),
    );
    if (filter === 'pending') list = list.filter((a) => !a.completed);
    if (filter === 'completed') list = list.filter((a) => a.completed);
    if (filter === 'overdue') list = list.filter((a) => !a.completed && a.deadline < today);
    return [...list].sort((a, b) => {
      if (sort === 'deadline') return a.deadline.localeCompare(b.deadline);
      if (sort === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return (subjects.find((s) => s.id === a.subjectId)?.code ?? 'zzz').localeCompare(
        subjects.find((s) => s.id === b.subjectId)?.code ?? 'zzz',
      );
    });
  }, [data.assignments, query, filter, sort, subjects, today]);

  const pending = data.assignments.filter((a) => !a.completed);
  const overdue = pending.filter((a) => a.deadline < today);
  const done = data.assignments.filter((a) => a.completed);

  const handleAdd = () => {
    if (!title.trim() || !subjectId || !deadline) return;
    addAssignment({ title: title.trim(), subjectId, deadline, priority, notes: notes.trim() || undefined });
    setTitle(''); setSubjectId(''); setDeadline(''); setPriority('Medium'); setNotes('');
    setAdding(false);
  };

  const counts: Record<Filter, number> = {
    all: data.assignments.length,
    pending: pending.length,
    completed: done.length,
    overdue: overdue.length,
  };

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryTile icon={ClipboardList} label="Total" value={counts.all} tone="bg-ink-900 text-white" />
        <SummaryTile icon={Clock} label="Pending" value={counts.pending} tone="bg-amber-500 text-white" />
        <SummaryTile icon={AlertTriangle} label="Overdue" value={counts.overdue} tone="bg-rose-500 text-white" />
        <SummaryTile icon={CheckCircle2} label="Completed" value={counts.completed} tone="bg-teal-500 text-white" />
      </div>

      <Card className="animate-fade-up">
        <CardHeader
          title="All assignments"
          subtitle={`${filtered.length} shown`}
          action={
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={14} /> Add assignment
            </Button>
          }
        />
        <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search assignments..."
              className={cn(inputCls, 'pl-9 py-1.5 text-xs')}
            />
          </div>
          <div className="flex items-center gap-2">
            <ListFilter size={14} className="shrink-0 text-ink-400" />
            {(['all', 'pending', 'overdue', 'completed'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-all',
                  filter === f
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200 hover:text-ink-700',
                )}
              >
                {f} ({counts[f]})
              </button>
            ))}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-full bg-ink-100 px-3 py-1 text-[11px] font-semibold text-ink-600 focus:outline-none"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="priority">Sort: Priority</option>
              <option value="subject">Sort: Subject</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={18} />}
            title="No assignments here"
            hint="Try a different filter, or add a new assignment to get started."
          />
        ) : (
          <ul className="divide-y divide-ink-50">
            {filtered.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                onToggle={() => toggleAssignment(a.id)}
                onDelete={() => deleteAssignment(a.id)}
              />
            ))}
          </ul>
        )}
      </Card>

      {/* Add modal */}
      <Modal open={adding} onClose={() => setAdding(false)} title="New assignment">
        <div className="space-y-4">
          <Field label="Title">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. OS assignment 2" autoFocus />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Subject">
              <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Deadline">
              <input type="date" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} min="2000-01-01" />
            </Field>
          </div>
          <Field label="Priority">
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'flex-1 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-inset transition-all',
                    priority === p
                      ? PRIORITY_STYLES[p] + ' ring-2'
                      : 'bg-white text-ink-400 ring-ink-200 hover:bg-ink-50',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes (optional)">
            <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details..." />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!title.trim() || !subjectId || !deadline}>
              Add assignment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <Card className="p-4 transition-all hover:shadow-card-hover animate-fade-up">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tone)}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-ink-950">{value}</p>
          <p className="text-[11px] font-semibold text-ink-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function AssignmentRow({
  assignment: a,
  onToggle,
  onDelete,
}: {
  assignment: Assignment;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const sub = useStore().subjects.find((s) => s.id === a.subjectId);
  const overdue = !a.completed && a.deadline < todayISO();
  const soon = !a.completed && daysUntil(a.deadline) >= 0 && daysUntil(a.deadline) <= 2;

  return (
    <li className={cn('group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-ink-50/60', a.completed && 'opacity-60')}>
      <button
        onClick={onToggle}
        className={cn(
          'mt-0.5 shrink-0 transition-all hover:scale-110',
          a.completed ? 'text-teal-600' : 'text-ink-300 hover:text-teal-600',
        )}
        aria-label={a.completed ? 'Mark pending' : 'Mark complete'}
      >
        {a.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold text-ink-900', a.completed && 'line-through decoration-ink-300')}>
          {a.title}
        </p>
        {a.notes && <p className="mt-0.5 line-clamp-1 text-xs text-ink-400">{a.notes}</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {sub && <SubjectChip name={sub.name} code={sub.code} color={sub.color} size="sm" />}
          <Badge className={PRIORITY_STYLES[a.priority]}>{a.priority}</Badge>
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11px] font-semibold',
              overdue ? 'text-rose-600' : soon ? 'text-amber-600' : 'text-ink-400',
            )}
          >
            {overdue ? <AlertTriangle size={11} /> : <CalendarDays size={11} />}
            {deadlineLabel(a.deadline)} · {fmtDate(a.deadline)}
          </span>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="rounded-lg p-1.5 text-ink-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
        aria-label="Delete assignment"
      >
        <Trash2 size={15} />
      </button>
    </li>
  );
}
