import { useMemo, useRef, useState } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  FileImage,
  Presentation,
  FileType2,
  Link2,
  Trash2,
  Search,
  Download,
  CloudUpload,
} from 'lucide-react';
import { Card, CardHeader, Badge, Button, Modal, Field, inputCls, EmptyState, ProgressBar } from '@/components/ui';
import { SUBJECT_COLORS, type SubjectColorKey } from '@/components/colors';
import { useStore, guessKind } from '@/lib/store';
import type { NoteFile, NoteKind } from '@/lib/types';
import { cn, fmtUploaded, fmtDate } from '@/lib/utils';

const KIND_ICON: Record<NoteKind, typeof FileText> = {
  PDF: FileText,
  DOCX: FileType2,
  PPTX: Presentation,
  Image: FileImage,
  Link: Link2,
};

const KIND_STYLE: Record<NoteKind, string> = {
  PDF: 'bg-rose-500/10 text-rose-600',
  DOCX: 'bg-sky-500/10 text-sky-600',
  PPTX: 'bg-amber-500/10 text-amber-600',
  Image: 'bg-emerald-500/10 text-emerald-600',
  Link: 'bg-violet-500/10 text-violet-600',
};

function fileToKindLabel(f: NoteFile): string {
  return f.kind;
}

export function NotesPage() {
  const { data, subjects, addNote, deleteNote } = useStore();
  const [activeSubject, setActiveSubject] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);

  // upload form
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [fileName, setFileName] = useState('');
  const [sizeLabel, setSizeLabel] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const notesBySubject = useMemo(() => {
    const map = new Map<string, NoteFile[]>();
    for (const n of data.notes) {
      const arr = map.get(n.subjectId) ?? [];
      arr.push(n);
      map.set(n.subjectId, arr);
    }
    return map;
  }, [data.notes]);

  const visible = useMemo(() => {
    let list = activeSubject === 'all' ? data.notes : notesBySubject.get(activeSubject) ?? [];
    list = list.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
    return [...list].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [data.notes, activeSubject, query, notesBySubject]);

  const handleFile = (file: File) => {
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    const kb = file.size / 1024;
    setSizeLabel(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);
  };

  const simulateUpload = () => {
    if (!title.trim() || !subjectId || !fileName) return;
    setUploading(true);
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + 12;
      });
    }, 90);
    setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      addNote({ title: title.trim(), subjectId, kind: guessKind(fileName), fileName, sizeLabel });
      setUploading(false);
      setProgress(0);
      setTitle(''); setSubjectId(''); setFileName(''); setSizeLabel('');
      setUploadOpen(false);
    }, 1100);
  };

  return (
    <div className="space-y-6">
      {/* Search + upload */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by title..."
            className={cn(inputCls, 'pl-10')}
          />
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload size={15} /> Upload notes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Subject folders */}
        <Card className="h-fit animate-fade-up">
          <CardHeader title="Subjects" subtitle={`${data.notes.length} files total`} />
          <div className="space-y-1 p-3">
            <FolderRow
              active={activeSubject === 'all'}
              onClick={() => setActiveSubject('all')}
              label="All notes"
              count={data.notes.length}
            />
            {subjects.map((s) => {
              const count = notesBySubject.get(s.id)?.length ?? 0;
              const c = SUBJECT_COLORS[s.color as SubjectColorKey] ?? SUBJECT_COLORS.ink;
              return (
                <FolderRow
                  key={s.id}
                  active={activeSubject === s.id}
                  onClick={() => setActiveSubject(s.id)}
                  label={s.code}
                  sublabel={s.name}
                  count={count}
                  dotClass={c.dot}
                />
              );
            })}
          </div>
        </Card>

        {/* File grid */}
        <div>
          {visible.length === 0 ? (
            <Card>
              <EmptyState
                icon={<FolderOpen size={18} />}
                title="No notes found"
                hint="Upload your first PDF or document to build this subject's library."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((n, i) => (
                <NoteCard key={n.id} note={n} index={i} onDelete={() => deleteNote(n.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload modal */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload notes">
        <div className="space-y-4">
          <button
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-all',
              fileName
                ? 'border-teal-300 bg-teal-50/60'
                : 'border-ink-200 bg-ink-50/50 hover:border-ink-300 hover:bg-ink-50',
            )}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-teal-600 shadow-soft">
              <CloudUpload size={20} />
            </div>
            {fileName ? (
              <>
                <p className="text-sm font-semibold text-ink-800">{fileName}</p>
                <p className="text-xs text-ink-400">{sizeLabel} · click to change file</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink-700">Click to choose a file</p>
                <p className="text-xs text-ink-400">PDF, DOCX, PPTX or images — stored locally in this demo</p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {uploading && (
            <div className="space-y-1">
              <ProgressBar value={progress} barClass="bg-teal-500" height="h-1.5" />
              <p className="text-right text-[10px] font-semibold text-ink-400">{Math.min(progress, 100)}%</p>
            </div>
          )}

          <Field label="Title">
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 5 summary" />
          </Field>
          <Field label="Subject">
            <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={simulateUpload} disabled={!title.trim() || !subjectId || !fileName || uploading}>
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Add to library'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FolderRow({
  active,
  onClick,
  label,
  sublabel,
  count,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sublabel?: string;
  count: number;
  dotClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-all',
        active ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-50',
      )}
    >
      <FolderOpen size={15} className={cn('shrink-0', active ? 'text-teal-400' : 'text-ink-400')} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold">{label}</span>
        {sublabel && <span className={cn('block truncate text-[10px]', active ? 'text-ink-300' : 'text-ink-400')}>{sublabel}</span>}
      </span>
      {dotClass && <span className={cn('h-2 w-2 shrink-0 rounded-full', dotClass)} />}
      <span className={cn('rounded-full px-1.5 text-[10px] font-bold', active ? 'bg-white/15' : 'bg-ink-100 text-ink-500')}>
        {count}
      </span>
    </button>
  );
}

function NoteCard({ note, index, onDelete }: { note: NoteFile; index: number; onDelete: () => void }) {
  const { subjectById } = useStore();
  const sub = subjectById(note.subjectId);
  const Icon = KIND_ICON[note.kind];
  return (
    <Card
      className="group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', KIND_STYLE[note.kind])}>
          <Icon size={18} />
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Download (demo)">
            <Download size={14} />
          </button>
          <button onClick={onDelete} className="rounded-lg p-1.5 text-ink-400 hover:bg-rose-50 hover:text-rose-600" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p className="mt-3 truncate text-sm font-semibold text-ink-900">{note.title}</p>
      <p className="truncate text-[11px] text-ink-400">{note.fileName}</p>
      <div className="mt-3 flex items-center justify-between">
        {sub ? (
          <Badge className={cn(SUBJECT_COLORS[sub.color as SubjectColorKey]?.chip ?? '')}>
            {sub.code}
          </Badge>
        ) : (
          <span />
        )}
        <span className="text-[10px] font-medium text-ink-400" title={fmtDate(note.uploadedAt)}>
          {fileToKindLabel(note)} · {note.sizeLabel} · {fmtUploaded(note.uploadedAt)}
        </span>
      </div>
    </Card>
  );
}
