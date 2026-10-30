-- Attendance & Task Management System schema (PostgreSQL 14+, Neon / Supabase)
-- Idempotent: safe to run multiple times (npm run db:migrate).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fixed, human-readable employee IDs: EMP-1001, EMP-1002, ...
CREATE SEQUENCE IF NOT EXISTS employee_id_seq START WITH 1001;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id VARCHAR(20) UNIQUE NOT NULL DEFAULT ('EMP-' || nextval('employee_id_seq')),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) UNIQUE NOT NULL,
  image       TEXT,
  role        VARCHAR(20) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMPTZ
);

-- Attendance (one row per employee per office-local day)
CREATE TABLE IF NOT EXISTS attendance (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date                    DATE NOT NULL,
  status                  VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'late')),
  -- check-in
  check_in_time           TIMESTAMPTZ NOT NULL,          -- server UTC timestamp
  check_in_local          VARCHAR(40) NOT NULL,          -- server-computed office local time
  check_in_lat            DECIMAL(10, 8),
  check_in_lng            DECIMAL(11, 8),
  check_in_accuracy       REAL,
  check_in_distance_m     INTEGER,
  check_in_location_type  VARCHAR(12) CHECK (check_in_location_type IN ('office', 'remote', 'unverified')),
  -- check-out
  check_out_time          TIMESTAMPTZ,
  check_out_local         VARCHAR(40),
  check_out_lat           DECIMAL(10, 8),
  check_out_lng           DECIMAL(11, 8),
  check_out_accuracy      REAL,
  check_out_distance_m    INTEGER,
  check_out_location_type VARCHAR(12) CHECK (check_out_location_type IN ('office', 'remote', 'unverified')),
  -- audit
  client_timezone         VARCHAR(64),
  flags                   TEXT[] NOT NULL DEFAULT '{}',
  ip_address              VARCHAR(64),
  user_agent              TEXT,
  UNIQUE (user_id, date)
);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance (date);

-- Individual tasks with per-task progress
CREATE TABLE IF NOT EXISTS tasks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date           DATE NOT NULL,
  description         TEXT NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  hours_spent         NUMERIC(4, 2) NOT NULL DEFAULT 0 CHECK (hours_spent >= 0 AND hours_spent <= 24),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON tasks (user_id, task_date);
CREATE INDEX IF NOT EXISTS tasks_date_idx ON tasks (task_date);

-- End-of-day reports
CREATE TABLE IF NOT EXISTS daily_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date         DATE NOT NULL,
  tasks_summary       TEXT NOT NULL,                      -- achievements
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  blockers            TEXT,
  next_day_plan       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, report_date)
);
CREATE INDEX IF NOT EXISTS daily_reports_date_idx ON daily_reports (report_date);

-- Individually approved sign-in emails (e.g. personal Gmail accounts), managed by admins
CREATE TABLE IF NOT EXISTS allowed_emails (
  email      VARCHAR(255) PRIMARY KEY,
  added_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email + password sign-in
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_logins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

-- One-time setup codes an admin shares so a person can set (or reset) their password
CREATE TABLE IF NOT EXISTS setup_codes (
  email      VARCHAR(255) PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
