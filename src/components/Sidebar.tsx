import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FolderOpen,
  BellRing,
  Settings2,
  X,
  GraduationCap,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { useStore } from '@/lib/store';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/assignments', label: 'Assignments', icon: ClipboardList },
  { to: '/notes', label: 'Notes Library', icon: FolderOpen },
  { to: '/reminders', label: 'Reminders', icon: BellRing },
  { to: '/profile', label: 'Profile & Settings', icon: Settings2 },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, data } = useStore();
  const location = useLocation();

  const pendingCount = data.assignments.filter((a) => !a.completed).length;
  const overdueCount = data.assignments.filter(
    (a) => !a.completed && a.deadline < new Date().toISOString().slice(0, 10),
  ).length;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy-950 text-ink-100 transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-inset ring-teal-400/30">
              <GraduationCap size={18} className="text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">CampusDesk</p>
              <p className="-mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-teal-400">
                AI Student OS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto px-3 scrollbar-thin">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-ink-500">
            Workspace
          </p>
          {NAV.map(({ to, label, icon: Icon }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/10 text-white shadow-soft'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white',
                )}
              >
                <Icon
                  size={17}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-teal-400' : 'text-ink-400 group-hover:text-ink-200',
                  )}
                />
                <span className="flex-1">{label}</span>
                {to === '/assignments' && pendingCount > 0 && (
                  <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 ring-1 ring-inset ring-teal-400/30">
                    {pendingCount}
                  </span>
                )}
                {to === '/reminders' && overdueCount > 0 && (
                  <span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4">
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-xs font-bold text-navy-950">
              {initials(profile.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{profile.name}</p>
              <p className="truncate text-[11px] text-ink-400">{profile.rollNo}</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
