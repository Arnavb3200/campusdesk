import { type ReactNode } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { initials, daysUntil, todayISO } from '@/lib/utils';

const TITLES: Record<string, { title: string; sub: string }> = {
  '/': { title: 'Dashboard', sub: 'Your day at a glance' },
  '/attendance': { title: 'Attendance Manager', sub: 'Track subject-wise attendance against the 75% rule' },
  '/assignments': { title: 'Assignment Manager', sub: 'Plan, track and complete your coursework' },
  '/notes': { title: 'Notes Library', sub: 'Your organised study material' },
  '/reminders': { title: 'Reminders', sub: 'Deadlines and attendance alerts in one place' },
  '/profile': { title: 'Profile & Settings', sub: 'Your details and preferences' },
};

export function Topbar({ onMenu, children }: { onMenu: () => void; children?: ReactNode }) {
  const { profile, data } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const meta = TITLES[location.pathname] ?? { title: 'Dashboard', sub: '' };

  const dueSoon = data.assignments.filter(
    (a) => !a.completed && daysUntil(a.deadline) >= 0 && daysUntil(a.deadline) <= 3,
  ).length;
  const overdue = data.assignments.filter((a) => !a.completed && a.deadline < todayISO()).length;
  const alertCount = dueSoon + overdue;

  return (
    <header className="sticky top-0 z-30 border-b border-ink-100 bg-ink-50/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="rounded-xl p-2 text-ink-500 transition-colors hover:bg-white hover:shadow-soft lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-xl font-medium tracking-tight text-ink-950 sm:text-2xl">
            {meta.title}
          </h1>
          <p className="hidden truncate text-xs text-ink-400 sm:block">{meta.sub}</p>
        </div>

        <button
          onClick={() => navigate('/reminders')}
          className="relative rounded-xl bg-white p-2.5 text-ink-500 shadow-soft transition-all hover:text-ink-800 hover:shadow-card"
          aria-label="Reminders"
        >
          <Bell size={18} />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-ink-50">
              {alertCount}
            </span>
          )}
        </button>

        <div className="hidden items-center gap-3 rounded-xl bg-white py-1.5 pl-1.5 pr-4 shadow-soft sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-[11px] font-bold text-navy-950">
            {initials(profile.name)}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink-900">{profile.name}</p>
            <p className="text-[10px] text-ink-400">{profile.semester}</p>
          </div>
        </div>
      </div>
      {children}
    </header>
  );
}
