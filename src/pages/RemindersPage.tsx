import { Link } from 'react-router-dom';
import {
  BellRing,
  AlarmClock,
  CalendarX2,
  CalendarCheck,
  ArrowRight,
  TrendingDown,
  Mail,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar, EmptyState } from '@/components/ui';
import { SubjectChip } from '@/components/subject';
import { PRIORITY_STYLES } from '@/components/colors';
import { useStore } from '@/lib/store';
import { cn, pct, classesNeeded, deadlineLabel, daysUntil, fmtDate, todayISO } from '@/lib/utils';

export function RemindersPage() {
  const { data, subjects, toggleAssignment } = useStore();
  const today = todayISO();

  const overdue = data.assignments
    .filter((a) => !a.completed && a.deadline < today)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const dueSoon = data.assignments
    .filter((a) => !a.completed && daysUntil(a.deadline) >= 0 && daysUntil(a.deadline) <= 7)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));
  const lowSubjects = subjects
    .filter((s) => s.held > 0 && pct(s.attended, s.held) < 75)
    .sort((a, b) => pct(a.attended, a.held) - pct(b.attended, b.held));

  const totalAlerts = overdue.length + dueSoon.length + lowSubjects.length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card
        className={cn(
          'flex flex-wrap items-center gap-4 p-5 animate-fade-up',
          totalAlerts === 0 ? 'bg-teal-50/60 border-teal-200' : 'bg-gradient-to-r from-ink-950 to-ink-800 border-ink-900 text-white',
        )}
      >
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            totalAlerts === 0 ? 'bg-teal-500/15 text-teal-600' : 'bg-white/10 text-teal-300',
          )}
        >
          <BellRing size={20} className={totalAlerts > 0 ? 'animate-pulse' : ''} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-bold', totalAlerts === 0 ? 'text-teal-900' : 'text-white')}>
            {totalAlerts === 0
              ? 'All clear — nothing needs your attention'
              : `${totalAlerts} item${totalAlerts > 1 ? 's' : ''} need your attention`}
          </p>
          <p className={cn('mt-0.5 text-xs', totalAlerts === 0 ? 'text-teal-700' : 'text-ink-300')}>
            {totalAlerts === 0
              ? 'Deadlines are on track and attendance is above 75% everywhere.'
              : `${overdue.length} overdue · ${dueSoon.length} due this week · ${lowSubjects.length} attendance alert${lowSubjects.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Overdue */}
        <AlertSection
          icon={<CalendarX2 size={16} />}
          iconTone="bg-rose-500/10 text-rose-600"
          title="Overdue assignments"
          subtitle="Complete these as soon as possible"
          empty="No overdue assignments. You are on top of everything."
        >
          {overdue.map((a) => {
            const sub = subjects.find((s) => s.id === a.subjectId);
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-3 transition-colors hover:bg-rose-50">
                <button
                  onClick={() => toggleAssignment(a.id)}
                  className="shrink-0 rounded-lg bg-white p-1.5 text-rose-500 shadow-soft transition-transform hover:scale-110"
                  title="Mark complete"
                >
                  <CalendarCheck size={14} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{a.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {sub && <SubjectChip name={sub.name} code={sub.code} color={sub.color} size="sm" />}
                    <Badge className={PRIORITY_STYLES[a.priority]}>{a.priority}</Badge>
                  </div>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-rose-600">{deadlineLabel(a.deadline)}</span>
              </div>
            );
          })}
        </AlertSection>

        {/* Due soon */}
        <AlertSection
          icon={<AlarmClock size={16} />}
          iconTone="bg-amber-500/10 text-amber-600"
          title="Due within 7 days"
          subtitle="Plan your week around these"
          empty="Nothing due in the next 7 days."
          action={
            <Link to="/assignments">
              <Button size="sm" variant="secondary">All assignments <ArrowRight size={12} /></Button>
            </Link>
          }
        >
          {dueSoon.map((a) => {
            const sub = subjects.find((s) => s.id === a.subjectId);
            const urgent = daysUntil(a.deadline) <= 2;
            return (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition-colors hover:bg-ink-50/60">
                <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold', urgent ? 'bg-amber-100 text-amber-700' : 'bg-ink-100 text-ink-500')}>
                  {daysUntil(a.deadline) === 0 ? 'Now' : `D${daysUntil(a.deadline)}`}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{a.title}</p>
                  {sub && <SubjectChip name={sub.name} code={sub.code} color={sub.color} size="sm" />}
                </div>
                <span className={cn('shrink-0 text-[11px] font-semibold', urgent ? 'text-amber-600' : 'text-ink-400')}>
                  {fmtDate(a.deadline)}
                </span>
              </div>
            );
          })}
        </AlertSection>
      </div>

      {/* Low attendance */}
      <Card className="animate-fade-up">
        <CardHeader
          title="Low attendance alerts"
          subtitle="Recovery plan to get back above 75%"
          action={
            <Link to="/attendance" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800">
              Attendance manager <ArrowRight size={13} />
            </Link>
          }
        />
        {lowSubjects.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={18} />}
            title="Attendance is healthy"
            hint="All subjects are above the 75% requirement."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {lowSubjects.map((s) => {
              const p = pct(s.attended, s.held);
              const need = classesNeeded(s.attended, s.held);
              return (
                <div key={s.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    {<SubjectChip name={s.name} code={s.code} color={s.color} />}
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                      <TrendingDown size={13} /> {p}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={p} barClass="bg-rose-500" height="h-1.5" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-ink-500">
                      {s.attended}/{s.held} classes
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                      Attend next {need} in a row
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Email digest hint */}
      <Card className="flex flex-wrap items-center gap-4 border-ink-100 bg-white p-5 animate-fade-up">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
          <Mail size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-900">Weekly email digest</p>
          <p className="text-xs text-ink-400">
            Manage digest delivery and other alerts in profile settings.
          </p>
        </div>
        <Link to="/profile">
          <Button variant="secondary" size="sm">Open settings</Button>
        </Link>
      </Card>
    </div>
  );
}

function AlertSection({
  icon,
  iconTone,
  title,
  subtitle,
  empty,
  action,
  children,
}: {
  icon: React.ReactNode;
  iconTone: string;
  title: string;
  subtitle: string;
  empty: string;
  action?: React.ReactNode;
  children: React.ReactNode[];
}) {
  const isEmpty = children.length === 0;
  return (
    <Card className="animate-fade-up">
      <CardHeader
        title={title}
        subtitle={subtitle}
        action={action}
      />
      <div className="space-y-2.5 p-4">
        {isEmpty ? (
          <EmptyState icon={icon} title={empty} />
        ) : (
          children
        )}
      </div>
      {/* iconTone applied to first icon contextually */}
      <span className={cn('hidden', iconTone)} />
    </Card>
  );
}
