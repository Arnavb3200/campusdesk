# Project memory

## Product intent & audience

- **CampusDesk AI** — premium SaaS-style student dashboard for college students.
- Frontend-only Vite + React + Tailwind app; no AI chatbot, no AI API, no backend, no authentication, no database.
- Initialized with sample demo data; user changes persisted to browser localStorage with a reset-to-demo option.
- Six functional areas: Dashboard, Attendance Manager, Assignment Manager, Notes Library, Reminders, Profile & Settings.

## Brand personality & voice

- Professional, academic, supportive and organized.
- Clarity-first: actionable metrics, warnings, and reminders over decorative content.

## Visual design & UX direction

- Professional teal/navy color theme; dark sidebar + clean white content cards.
- Sidebar navigation across the six pages; responsive layouts.
- Custom pure-SVG charts (donut, trend line, bar chart) — no charting library added.
- Lucide React icons throughout.
- Cards for stats, deadlines, classes, and subject breakdowns.
- Attendance visualized with a 75% target marker; below-threshold subjects flagged.
- Assignments flagged overdue in red; search/filter/sort UI provided.
- Notes library uses subject folders with counts and a file-upload interface with progress bar.

## Decisions, constraints & rationale

- `react-router-dom` added for page routing (only extra package beyond template defaults).
- Pure SVG charts chosen to keep dependencies minimal and match the no-extra-packages preference.
- App-wide state store persisted to localStorage so changes survive reloads without a backend.
- Attendance manager computes live percentages and shows classes-to-attend (below 75%) or classes-can-skip (above 75%).
- Assignment model: subject, deadline, priority; statuses pending/overdue/completed.
- Notes upload accepts PDF, DOCX, PPTX, and images; organized per subject.
- Reminders aggregate overdue work, deadlines within 7 days, and low-attendance recovery plans.
- Profile/Settings editable; includes weekly study-goal slider and notification toggles.
- "AI" in product name is branding only — no AI features implemented per constraints.

## Open questions & assumptions

- 75% attendance threshold treated as a fixed default per the request.
- Demo data is placeholder; no real institution/timetable integration.
- Profile and settings state is local-only; not synced across devices.
- Future backend/auth/database intentionally deferred.