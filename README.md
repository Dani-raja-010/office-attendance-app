# WorkTrack — Attendance & Task Management

GPS-verified attendance, daily task tracking, and end-of-day reporting, built on the stack from the PRD:

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Server Actions) |
| Auth | Auth.js v5 (NextAuth) — email + password (admin-issued setup codes), optional Google OAuth, JWT sessions |
| Database | PostgreSQL (Neon / Supabase) via `postgres` |
| UI | Tailwind CSS v4 + shadcn-style components |
| Hosting | Vercel |

## Features

**Employees**
- **Email + password sign-in.** An admin adds the employee's email and gets a one-time **setup code** (valid 7 days) to send them; the employee opens */setup*, enters the code and picks a password. Passwords are hashed with scrypt, and 5 wrong attempts lock the account for 15 minutes. Google sign-in is also offered once `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` are set.
- A permanent employee ID (`EMP-1001`, `EMP-1002`, …) is assigned by a database sequence when the account is first set up.
- One-tap **check-in / check-out** that samples the device location for up to 15 s and keeps the most precise fix (stopping early at ±20 m). The server records the UTC timestamp and the office-local time; the client never sets the time.
- **Geofencing**: each check-in is classed as *Office* or *Remote* by its distance from the office (`OFFICE_RADIUS_METERS`). It is marked *Late* when it comes after shift start plus the grace period.
- **Tasks**: description, status (To do / In progress / Completed / Blocked), hours spent, and a per-task progress bar.
- **EOD report**: achievements, blockers, next-day plan, and overall progress (suggested from the average of the day's tasks).
- Attendance history with hours worked.

**Admins**
- **Live overview** that refreshes every 30 s: Present, Late, Absent, Remote, Flagged, and EOD-report compliance, plus a list of absentees.
- **Location verification**: every check-in/out links straight to Google Maps.
- Attendance records filtered by date range and employee.
- Reports & tasks view per employee.
- **One-click CSV / Excel export** of attendance, EOD reports, and tasks for payroll and audit. Exports are protected against formula injection.
- **Approved emails**: add employees (e.g. personal Gmail addresses) under *Employees* and send them their setup code. *Reset password* issues a new code. Removing an email also deactivates the account.
- Employee management: promote or demote admins, deactivate or reactivate accounts. Changes apply immediately because roles are re-read from the DB on every request.

### Anti-spoofing (server-side)
Browser coordinates can't be fully trusted, so `src/lib/geo.ts` checks every reading on the server:

| Check | Result |
| --- | --- |
| Out-of-range / (0,0) coordinates | Rejected |
| Accuracy worse than `MAX_GPS_ACCURACY_METERS` | Rejected |
| Position timestamp older than 10 min | Rejected (older than 2 min: flagged) |
| Accuracy worse than 75 m | Flagged `low_accuracy` |
| Accuracy missing | Rejected |
| Accuracy of exactly 0, or coordinates with only 3 decimals (hand-typed values) | Flagged `suspicious_precision` |
| GPS more than `IP_MISMATCH_KM` away from Vercel's IP geolocation | Flagged `ip_location_mismatch` |
| Check-in to check-out movement faster than 900 km/h | Flagged `impossible_travel` |

Flags show up as badges on the admin dashboard and in exports.

## Getting started

### 1. Database
Create a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com) and copy the **pooled** connection string.

### 2. First admin
Put your email in `ADMIN_EMAILS` and a secret phrase in `ADMIN_SETUP_CODE`. Open */setup*, enter your email and that code, and choose your password. You can then add employees from *Admin → Employees*.

### 2b. Google OAuth (optional)
In [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), create an *OAuth client ID* (Web application) and add these authorized redirect URIs:
- `http://localhost:3000/api/auth/callback/google`
- `https://<your-vercel-domain>/api/auth/callback/google`

For Workspace-only access, set the OAuth consent screen to *Internal*. The app also enforces `ALLOWED_EMAIL_DOMAINS` on its own.

### 3. Configure & run
```bash
cp .env.example .env.local   # fill in the values
npm install
npm run db:migrate           # applies db/schema.sql (idempotent)
npm run dev
```
Open http://localhost:3000 and sign in. Any email listed in `ADMIN_EMAILS` gets the admin role when it logs in.

> Geolocation needs a secure context: `localhost` works in development, and production must use HTTPS (Vercel does this by default).

### 4. Deploy to Vercel
1. Push the repo to GitHub and import it in Vercel.
2. Add every variable from `.env.example` under **Project → Settings → Environment Variables**.
3. Deploy, then run `npm run db:migrate` once against the production `DATABASE_URL`.

## Environment variables
See [`.env.example`](.env.example) for the full annotated list. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `DATABASE_POOL_MAX` | Max connections per instance (default 5) |
| `AUTH_SECRET` | Signs session cookies |
| `ADMIN_SETUP_CODE` | Lets an `ADMIN_EMAILS` address set or reset its password on */setup* |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Optional Google sign-in |
| `ALLOWED_EMAIL_DOMAINS` | Company domains allowed to sign in. Optional: without it, only `ADMIN_EMAILS` and emails approved on the *Employees* page can sign in |
| `ADMIN_EMAILS` | Emails granted admin on login |
| `OFFICE_LAT`, `OFFICE_LNG`, `OFFICE_RADIUS_METERS` | Geofence. If unset, check-ins are stored as *Unverified* |
| `OFFICE_TIMEZONE`, `OFFICE_START_TIME`, `LATE_GRACE_MINUTES`, `WORK_DAYS` | Attendance rules |

## Project structure
```
db/schema.sql                 SQL schema (users, attendance, tasks, daily_reports)
scripts/migrate.mjs           Applies the schema
src/auth.config.ts            Database-free Auth.js config (used by the proxy)
src/auth.ts                   Full Auth.js config: domain check, user upsert, JWT
src/proxy.ts                  Route protection (Next.js 16 "proxy", formerly middleware)
src/lib/                      Data access layer, geo verification, time zones, exports
src/app/actions/              Server Actions (attendance, tasks/reports, admin, auth)
src/app/(app)/                Authenticated pages (employee + /admin)
src/app/api/admin/export/     CSV / Excel export endpoint
src/components/               UI components
```

## Schema notes
The schema follows PRD §4 and adds the columns the features need:
- `attendance`: status, accuracy, geofence distance and type, audit fields (IP, user agent, flags), and a `UNIQUE (user_id, date)` constraint.
- `tasks`: a new table for per-task status, hours, and progress.
- `daily_reports`: adds `next_day_plan` and `UNIQUE (user_id, report_date)`.

Timestamps are stored as `TIMESTAMPTZ` (UTC), with the office-local time kept next to them.
