import { useState } from 'react';
import {
  User,
  GraduationCap,
  Bell,
  Target,
  RotateCcw,
  Check,
  Mail,
  School,
  Save,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, Field, inputCls, ProgressBar } from '@/components/ui';
import { useStore } from '@/lib/store';
import { cn, initials, pct } from '@/lib/utils';

export function ProfilePage() {
  const { data, updateProfile, resetDemo } = useStore();
  const p = data.profile;
  const [form, setForm] = useState(p);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const overall = pct(
    data.subjects.reduce((s, x) => s + x.attended, 0),
    data.subjects.reduce((s, x) => s + x.held, 0),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Identity card */}
      <Card className="overflow-hidden animate-fade-up">
        <div className="h-24 bg-gradient-to-r from-navy-950 via-ink-900 to-teal-900" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-sky-500 text-xl font-bold text-navy-950 ring-4 ring-white">
              {initials(form.name)}
            </div>
            <div className="pb-1">
              <h2 className="font-serif text-xl font-medium text-ink-950">{form.name}</h2>
              <p className="text-xs text-ink-400">
                {form.course} · {form.semester}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 ring-teal-200">
              <GraduationCap size={12} /> {form.rollNo}
            </Badge>
            <Badge className="bg-sky-50 text-sky-700 ring-sky-200">{form.year}</Badge>
          </div>
        </div>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStat label="Attendance" value={`${overall}%`} />
        <MiniStat label="Subjects" value={String(data.subjects.length)} />
        <MiniStat
          label="Notes saved"
          value={String(data.notes.length)}
        />
      </div>

      {/* Personal details */}
      <Card className="animate-fade-up">
        <CardHeader title="Personal details" subtitle="Used across the dashboard" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Email">
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input className={cn(inputCls, 'pl-9')} value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
          </Field>
          <Field label="Roll number">
            <input className={inputCls} value={form.rollNo} onChange={(e) => set('rollNo', e.target.value)} />
          </Field>
          <Field label="College">
            <div className="relative">
              <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input className={cn(inputCls, 'pl-9')} value={form.college} onChange={(e) => set('college', e.target.value)} />
            </div>
          </Field>
          <Field label="Course">
            <input className={inputCls} value={form.course} onChange={(e) => set('course', e.target.value)} />
          </Field>
          <Field label="Branch">
            <input className={inputCls} value={form.branch} onChange={(e) => set('branch', e.target.value)} />
          </Field>
          <Field label="Year">
            <select className={inputCls} value={form.year} onChange={(e) => set('year', e.target.value)}>
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
          <Field label="Semester">
            <select className={inputCls} value={form.semester} onChange={(e) => set('semester', e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={`Semester ${s}`}>{`Semester ${s}`}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="animate-fade-up">
        <CardHeader title="Preferences" subtitle="Alerts and study goals" />
        <div className="space-y-5 p-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-teal-600" />
                <span className="text-sm font-semibold text-ink-800">Weekly study goal</span>
              </div>
              <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 ring-1 ring-inset ring-teal-200">
                {form.weeklyGoalHours} hrs / week
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={40}
              step={1}
              value={form.weeklyGoalHours}
              onChange={(e) => set('weeklyGoalHours', Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-ink-400">
              <span>4h</span>
              <span>40h</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={(form.weeklyGoalHours / 40) * 100} barClass="bg-teal-500" height="h-1" />
            </div>
          </div>

          <div className="border-t border-ink-100 pt-4">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={15} className="text-teal-600" />
              <span className="text-sm font-semibold text-ink-800">Notifications</span>
            </div>
            <div className="space-y-2">
              <Toggle
                label="Assignment deadline alerts"
                hint="Notify me 2 days before a deadline"
                checked={form.notifications.deadlines}
                onChange={(v) => set('notifications', { ...form.notifications, deadlines: v })}
              />
              <Toggle
                label="Low attendance alerts"
                hint="Warn me when any subject drops below 75%"
                checked={form.notifications.attendanceAlerts}
                onChange={(v) => set('notifications', { ...form.notifications, attendanceAlerts: v })}
              />
              <Toggle
                label="Morning digest"
                hint="Daily summary of classes and tasks at 8 AM"
                checked={form.notifications.morningDigest}
                onChange={(v) => set('notifications', { ...form.notifications, morningDigest: v })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <Button onClick={save} className={cn(saved && 'bg-teal-600 hover:bg-teal-700')}>
          {saved ? <Check size={15} /> : <Save size={15} />} {saved ? 'Saved' : 'Save changes'}
        </Button>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-ink-500">Reset everything back to the demo data?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetDemo();
                setForm({ ...p, ...data.profile });
                setConfirmReset(false);
                window.location.reload();
              }}
            >
              Yes, reset
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={14} /> Reset to demo data
          </Button>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3 p-4 animate-fade-up">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-100 text-ink-600">
        <User size={15} />
      </div>
      <div>
        <p className="text-lg font-bold tracking-tight text-ink-950">{value}</p>
        <p className="text-[11px] font-semibold text-ink-500">{label}</p>
      </div>
    </Card>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-ink-100 px-4 py-3 text-left transition-colors hover:bg-ink-50/60"
    >
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        <span className="block text-[11px] text-ink-400">{hint}</span>
      </span>
      <span
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-teal-500' : 'bg-ink-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  );
}
