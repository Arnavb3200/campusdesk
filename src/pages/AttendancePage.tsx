import { useState } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  X as XIcon,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar, Modal, Field, inputCls, EmptyState } from '@/components/ui';
import { Donut } from '@/components/charts';
import { SUBJECT_COLORS, type SubjectColorKey } from '@/components/colors';
import { useStore } from '@/lib/store';
import type { Subject } from '@/lib/types';
import { cn, pct, classesNeeded, skippable, initials } from '@/lib/utils';

const COLOR_KEYS: SubjectColorKey[] = ['teal', 'sky', 'amber', 'violet', 'rose', 'emerald'];

export function AttendancePage() {
  const { subjects, markAttendance, addSubject, deleteSubject } = useStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  const totalAttended = subjects.reduce((s, x) => s + x.attended, 0);
  const totalHeld = subjects.reduce((s, x) => s + x.held, 0);
  const overall = pct(totalAttended, totalHeld);
  const atRisk = subjects.filter((s) => s.held > 0 && pct(s.attended, s.held) < 75);

  const sorted = [...subjects].sort((a, b) => pct(a.attended, a.held) - pct(b.attended, b.held));

  const handleAdd = () => {
    if (!newName.trim()) return;
    addSubject({ name: newName.trim(), code: newCode.trim() || 'GEN' });
    setNewName('');
    setNewCode('');
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex items-center gap-5 p-5 animate-fade-up">
          <Donut
            value={overall}
            color={overall >= 75 ? '#0d9488' : '#e11d48'}
            targetPct={75}
            size={116}
            sublabel="target 75%"
          />
          <div>
            <p className="text-sm font-semibold text-ink-900">Overall attendance</p>
            <p className="mt-1 text-xs text-ink-400">
              {totalAttended} attended of {totalHeld} classes held
            </p>
            <Badge
              className={
                overall >= 75
                  ? 'mt-2 bg-teal-50 text-teal-700 ring-teal-200'
                  : 'bg-rose-50 text-rose-700 ring-rose-200'
              }
            >
              {overall >= 75 ? (
                <><ShieldCheck size={12} /> On track</>
              ) : (
                <><AlertTriangle size={12} /> Below target</>
              )}
            </Badge>
          </div>
        </Card>

        <Card className="p-5 animate-fade-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold tracking-tight text-ink-950">{atRisk.length}</p>
              <p className="text-xs font-semibold text-ink-600">Subjects below 75%</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {atRisk.length === 0 ? (
              <p className="text-xs text-ink-400">Every subject is above the target. Nice work.</p>
            ) : (
              atRisk.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-ink-700">{s.code}</span>
                  <span className="font-semibold text-rose-600">
                    +{classesNeeded(s.attended, s.held)} classes needed
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-ink-950">
                  {subjects.length}
                </p>
                <p className="text-xs font-semibold text-ink-600">Enrolled subjects</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus size={14} /> Add
            </Button>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Track each subject separately to catch shortfalls early.
          </p>
        </Card>
      </div>

      {/* Subject rows */}
      <Card className="animate-fade-up">
        <CardHeader title="Subject-wise attendance" subtitle="Mark today's class as attended or missed" />
        {subjects.length === 0 ? (
          <EmptyState icon={<CalendarCheck size={18} />} title="No subjects yet" hint="Add a subject to start tracking attendance." />
        ) : (
          <div className="divide-y divide-ink-50">
            {sorted.map((s) => (
              <SubjectRow key={s.id} subject={s} onMark={markAttendance} onDelete={deleteSubject} />
            ))}
          </div>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add subject">
        <div className="space-y-4">
          <Field label="Subject name">
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Machine Learning"
              autoFocus
            />
          </Field>
          <Field label="Course code">
            <input
              className={inputCls}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. CS401"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newName.trim()}>Add subject</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SubjectRow({
  subject,
  onMark,
  onDelete,
}: {
  subject: Subject;
  onMark: (id: string, attended: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const p = pct(subject.attended, subject.held);
  const c = SUBJECT_COLORS[subject.color as SubjectColorKey] ?? SUBJECT_COLORS.ink;
  const need = classesNeeded(subject.attended, subject.held);
  const canSkip = skippable(subject.attended, subject.held);
  const below = need > 0;

  return (
    <div className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-ink-50/50 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
            c.chip,
          )}
        >
          {initials(subject.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{subject.name}</p>
          <p className="text-[11px] text-ink-400">
            {subject.code} · {subject.attended}/{subject.held} classes
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:w-96">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={cn('font-bold', below ? 'text-rose-600' : 'text-teal-700')}>{p}%</span>
            {below ? (
              <span className="font-medium text-rose-500">Attend {need} in a row</span>
            ) : (
              <span className="font-medium text-teal-600">Can miss {canSkip}</span>
            )}
          </div>
          <ProgressBar value={p} barClass={below ? 'bg-rose-500' : c.bar} height="h-2" />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onMark(subject.id, true)}
          className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200 transition-all hover:bg-teal-100 active:scale-95"
          title="Mark attended"
        >
          <Check size={13} /> Attended
        </button>
        <button
          onClick={() => onMark(subject.id, false)}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 transition-all hover:bg-rose-100 active:scale-95"
          title="Mark missed"
        >
          <XIcon size={13} /> Missed
        </button>
        {confirming ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(subject.id)}
              className="rounded-lg bg-rose-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg bg-ink-100 px-2 py-1.5 text-[11px] font-semibold text-ink-600 hover:bg-ink-200"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
            title="Delete subject"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
