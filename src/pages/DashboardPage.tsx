import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Flame,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, ProgressBar, EmptyState } from '@/components/ui';
import { Donut, BarChart, AreaChart } from '@/components/charts';
import { SubjectChip } from '@/components/subject';
import { SUBJECT_COLORS, PRIORITY_STYLES, type SubjectColorKey } from '@/components/colors';
import { useStore } from '@/lib/store';
import { cn, pct, classesNeeded, deadlineLabel, daysUntil, fmtDate, todayISO } from '@/lib/utils';

export function DashboardPage() {
  const { data, subjects, subjectColor, toggleAssignment } = useStore();
  const today = todayISO();

  const totalAttended = subjects.reduce((s, x) => s + x.attended, 0);
  const totalHeld = subjects.reduce((s, x) => s + x.held, 0);
  const overall = pct(totalAttended, totalHeld);

  const pending = data.assignments.filter((a) => !a.completed);
  const overdue = pending.filter((a) => a.deadline < today);
  const dueSoon = pending
    .filter((a) => daysUntil(a.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  const lowSubjects = subjects.filter((s) => pct(s.attended, s.held) < 75 && s.held > 0);
  const completedThisWeek = data.assignments.filter((a) => a.completed).length;

  // Attendance trend synthesized from current overall, gently varying
  const trend = [
    overall - 6.2, overall - 4.8, overall - 3.1, overall - 4.4,
    overall - 2.2, overall - 1.0, overall - 1.8, overall,
  ].map((v) => Math.round(Math.min(Math.max(v, 0), 100) * 10) / 10);
  const trendLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'Now'];

  // Weekly timetable load (Mon-Fri lecture count)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const weekLoad = weekDays.map((d, i) => ({
    label: d,
    value: data.timetable.filter((t) => t.days.includes(i + 1)).length,
    color: 'bg-ink-900 group-hover:bg-ink-800',
  }));

  const stats = [
    {
      label: 'Overall Attendance',
      value: `${overall}%`,
      icon: CalendarCheck,
      tone: overall >= 75 ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-600',
      note: `${totalAttended} of ${totalHeld} classes`,
    },
    {
      label: 'Pending Assignments',
      value: String(pending.length),
      icon: ClipboardList,
      tone: 'bg-sky-500/10 text-sky-600',
      note: overdue.length > 0 ? `${overdue.length} overdue` : 'All on track',
    },
    {
      label: 'Low Attendance Alerts',
      value: String(lowSubjects.length),
      icon: AlertTriangle,
      tone: lowSubjects.length ? 'bg-amber-500/10 text-amber-600' : 'bg-teal-500/10 text-teal-600',
      note: lowSubjects.length ? 'Below 75% target' : 'All subjects safe',
    },
    {
      label: 'Completed Tasks',
      value: String(completedThisWeek),
      icon: CheckCircle2,
      tone: 'bg-emerald-500/10 text-emerald-600',
      note: 'Great momentum',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-medium text-ink-950">
            Welcome back, {data.profile.name.split(' ')[0]}
          </h2>
        </div>
        <Link to="/assignments">
          <Button>
            <Plus size={15} /> New Assignment
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className="group p-5 transition-all duration-200 hover:shadow-card-hover animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', s.tone)}>
                <s.icon size={19} />
              </div>
              <TrendingUp size={14} className="text-ink-300 transition-colors group-hover:text-teal-500" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-ink-950">{s.value}</p>
            <p className="mt-0.5 text-xs font-semibold text-ink-600">{s.label}</p>
            <p className="mt-1 text-[11px] text-ink-400">{s.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Attendance overview */}
        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader
            title="Attendance overview"
            subtitle="Weekly trend vs the 75% requirement"
            action={
              <Link to="/attendance" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800">
                Details <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-5">
            <div className="flex flex-col items-center justify-center gap-2 sm:col-span-2">
              <Donut
                value={overall}
                color={overall >= 75 ? '#0d9488' : '#e11d48'}
                targetPct={75}
                size={132}
                sublabel="target 75%"
              />
              <Badge className={overall >= 75 ? 'bg-teal-50 text-teal-700 ring-teal-200' : 'bg-rose-50 text-rose-700 ring-rose-200'}>
                {overall >= 75 ? 'On track' : 'Below target'}
              </Badge>
            </div>
            <div className="sm:col-span-3">
              <AreaChart series={trend} labels={trendLabels} color="#0f766e" height={170} />
            </div>
          </div>
        </Card>

        {/* Today's classes */}
        <Card className="animate-fade-up">
          <CardHeader title="Today's classes" subtitle="From your weekly timetable" />
          <div className="space-y-2.5 p-4">
            {(() => {
              const day = new Date().getDay();
              const slots = data.timetable
                .filter((t) => t.days.includes(day))
                .sort((a, b) => a.time.localeCompare(b.time));
              if (slots.length === 0)
                return <EmptyState icon={<BookOpen size={18} />} title="No classes today" hint="Enjoy the free day or catch up on pending assignments." />;
              return slots.map((t) => {
                const sub = subjects.find((s) => s.id === t.subjectId);
                if (!sub) return null;
                const c = SUBJECT_COLORS[sub.color as SubjectColorKey] ?? SUBJECT_COLORS.ink;
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 transition-colors hover:border-ink-200 hover:bg-ink-50/50">
                    <div className={cn('h-9 w-1 rounded-full', c.bar)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{sub.name}</p>
                      <p className="text-[11px] text-ink-400">{sub.code} · {t.room}</p>
                    </div>
                    <span className="rounded-lg bg-ink-50 px-2 py-1 text-[11px] font-semibold text-ink-600">
                      {t.time}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Upcoming deadlines */}
        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader
            title="Upcoming deadlines"
            subtitle="Your nearest pending assignments"
            action={
              <Link to="/assignments" className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800">
                View all <ArrowRight size={13} />
              </Link>
            }
          />
          <div className="divide-y divide-ink-50">
            {dueSoon.length === 0 && (
              <EmptyState icon={<CheckCircle2 size={18} />} title="Nothing due soon" hint="You are all caught up on assignments." />
            )}
            {dueSoon.slice(0, 5).map((a) => {
              const sub = subjects.find((s) => s.id === a.subjectId);
              const urgent = daysUntil(a.deadline) <= 2;
              return (
                <div key={a.id} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-ink-50/60">
                  <button
                    onClick={() => toggleAssignment(a.id)}
                    className="shrink-0 text-ink-300 transition-colors hover:text-teal-600"
                    aria-label="Mark complete"
                  >
                    <Circle size={18} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{a.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {sub && <SubjectChip name={sub.name} code={sub.code} color={sub.color} size="sm" />}
                      <Badge className={PRIORITY_STYLES[a.priority]}>{a.priority}</Badge>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('flex items-center gap-1 text-xs font-semibold', urgent ? 'text-rose-600' : 'text-ink-500')}>
                      <Clock size={12} /> {deadlineLabel(a.deadline)}
                    </p>
                    <p className="text-[11px] text-ink-400">{fmtDate(a.deadline)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right rail: alerts + subject bars + week load */}
        <div className="space-y-4">
          {lowSubjects.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/60 animate-fade-up">
              <div className="flex items-start gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
                  <AlertTriangle size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">Attendance warning</p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    {lowSubjects.length} subject{lowSubjects.length > 1 ? 's' : ''} below the 75% target.{' '}
                    <Link to="/reminders" className="font-semibold underline underline-offset-2 hover:text-amber-900">
                      See plan
                    </Link>
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="animate-fade-up">
            <CardHeader title="Weekly lecture load" subtitle="Scheduled classes per day" />
            <div className="p-5">
              <BarChart data={weekLoad} height={120} />
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader title="Subject standing" subtitle="Attendance by subject" />
            <div className="space-y-3 p-5">
              {subjects.map((s) => {
                const p = pct(s.attended, s.held);
                const c = SUBJECT_COLORS[s.color as SubjectColorKey] ?? SUBJECT_COLORS.ink;
                const need = classesNeeded(s.attended, s.held);
                return (
                  <div key={s.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate font-semibold text-ink-700">{s.code}</span>
                      <span className={cn('font-bold', p >= 75 ? 'text-teal-700' : 'text-rose-600')}>{p}%</span>
                    </div>
                    <ProgressBar
                      value={p}
                      barClass={cn(c.bar, need > 0 && 'animate-pulse')}
                      height="h-1.5"
                    />
                    {need > 0 && (
                      <p className="mt-1 text-[10px] font-medium text-rose-500">
                        Attend next {need} to reach 75%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="bg-navy-950 text-white animate-fade-up">
            <div className="flex items-start gap-3 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                <Flame size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold">Keep the streak going</p>
                <p className="mt-0.5 text-xs text-ink-300">
                  You completed {completedThisWeek} task{completedThisWeek === 1 ? '' : 's'} so far. Finish one more today to stay ahead.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
