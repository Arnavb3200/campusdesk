import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { DashboardPage } from '@/pages/DashboardPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { NotesPage } from '@/pages/NotesPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { useEffect } from 'react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="lg:pl-64">
        <ScrollToTop />
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="px-4 pb-12 pt-2 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </StoreProvider>
  );
}
