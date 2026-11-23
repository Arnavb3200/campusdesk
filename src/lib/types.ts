export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  attended: number;
  held: number;
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  deadline: string; // ISO yyyy-mm-dd
  priority: Priority;
  completed: boolean;
  notes?: string;
}

export type NoteKind = 'PDF' | 'DOCX' | 'PPTX' | 'Image' | 'Link';

export interface NoteFile {
  id: string;
  title: string;
  subjectId: string;
  kind: NoteKind;
  fileName: string;
  sizeLabel: string;
  uploadedAt: string; // ISO yyyy-mm-dd
}

export interface Profile {
  name: string;
  email: string;
  rollNo: string;
  course: string;
  branch: string;
  year: string;
  semester: string;
  college: string;
  weeklyGoalHours: number;
  notifications: {
    deadlines: boolean;
    attendanceAlerts: boolean;
    morningDigest: boolean;
  };
}

export interface TimetableSlot {
  id: string;
  time: string;
  endTime: string;
  subjectId: string;
  room: string;
  days: number[]; // 0=Sun..6=Sat
}

export interface AppData {
  subjects: Subject[];
  assignments: Assignment[];
  notes: NoteFile[];
  timetable: TimetableSlot[];
  profile: Profile;
}
