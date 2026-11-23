import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppData, Assignment, NoteFile, NoteKind, Profile, Subject } from './types';
import { DEMO_DATA } from './demo';
import { uid } from './utils';

const STORAGE_KEY = 'campusdesk-data-v1';

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.subjects || !parsed.assignments || !parsed.profile) return DEMO_DATA;
    return parsed as AppData;
  } catch {
    return DEMO_DATA;
  }
}

export function guessKind(fileName: string): NoteKind {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'PDF';
  if (ext === 'docx' || ext === 'doc') return 'DOCX';
  if (ext === 'pptx' || ext === 'ppt') return 'PPTX';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'Image';
  return 'Link';
}

interface Store {
  data: AppData;
  profile: Profile;
  subjects: Subject[];
  subjectById: (id: string) => Subject | undefined;
  subjectColor: (id: string) => string;
  addAssignment: (a: Omit<Assignment, 'id' | 'completed'>) => void;
  updateAssignment: (id: string, patch: Partial<Omit<Assignment, 'id'>>) => void;
  toggleAssignment: (id: string) => void;
  deleteAssignment: (id: string) => void;
  markAttendance: (subjectId: string, attended: boolean) => void;
  addSubject: (s: { name: string; code: string }) => void;
  deleteSubject: (id: string) => void;
  addNote: (n: Omit<NoteFile, 'id' | 'uploadedAt'>) => void;
  deleteNote: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage unavailable (private mode) — in-memory only
    }
  }, [data]);

  const addAssignment = useCallback((a: Omit<Assignment, 'id' | 'completed'>) => {
    setData((d) => ({
      ...d,
      assignments: [{ ...a, id: uid('asg'), completed: false }, ...d.assignments],
    }));
  }, []);

  const updateAssignment = useCallback((id: string, patch: Partial<Omit<Assignment, 'id'>>) => {
    setData((d) => ({
      ...d,
      assignments: d.assignments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  const toggleAssignment = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      assignments: d.assignments.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
    }));
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setData((d) => ({ ...d, assignments: d.assignments.filter((a) => a.id !== id) }));
  }, []);

  const markAttendance = useCallback((subjectId: string, attended: boolean) => {
    setData((d) => ({
      ...d,
      subjects: d.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, held: s.held + 1, attended: s.attended + (attended ? 1 : 0) }
          : s,
      ),
    }));
  }, []);

  const addSubject = useCallback((s: { name: string; code: string }) => {
    const palette = ['teal', 'sky', 'amber', 'violet', 'rose', 'emerald'];
    setData((d) => ({
      ...d,
      subjects: [
        ...d.subjects,
        { id: uid('sub'), name: s.name, code: s.code, color: palette[d.subjects.length % palette.length], attended: 0, held: 0 },
      ],
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      subjects: d.subjects.filter((s) => s.id !== id),
      assignments: d.assignments.filter((a) => a.subjectId !== id),
      notes: d.notes.filter((n) => n.subjectId !== id),
    }));
  }, []);

  const addNote = useCallback((n: Omit<NoteFile, 'id' | 'uploadedAt'>) => {
    const uploadedAt = new Date();
    const y = uploadedAt.getFullYear();
    const m = String(uploadedAt.getMonth() + 1).padStart(2, '0');
    const day = String(uploadedAt.getDate()).padStart(2, '0');
    setData((d) => ({
      ...d,
      notes: [{ ...n, id: uid('note'), uploadedAt: `${y}-${m}-${day}` }, ...d.notes],
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setData((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
  }, []);

  const updateProfile = useCallback((p: Partial<Profile>) => {
    setData((d) => ({ ...d, profile: { ...d.profile, ...p } }));
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(DEMO_DATA);
  }, []);

  const value = useMemo<Store>(
    () => ({
      data,
      profile: data.profile,
      subjects: data.subjects,
      subjectById: (id) => data.subjects.find((s) => s.id === id),
      subjectColor: (id) => data.subjects.find((s) => s.id === id)?.color ?? 'ink',
      addAssignment,
      updateAssignment,
      toggleAssignment,
      deleteAssignment,
      markAttendance,
      addSubject,
      deleteSubject,
      addNote,
      deleteNote,
      updateProfile,
      resetDemo,
    }),
    [data, addAssignment, updateAssignment, toggleAssignment, deleteAssignment, markAttendance, addSubject, deleteSubject, addNote, deleteNote, updateProfile, resetDemo],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
