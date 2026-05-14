-- Create vacation_db if it doesn't exist
SELECT 'CREATE DATABASE vacation_db'
  WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'vacation_db'
  )\gexec

-- Switch into it
\connect vacation_db

-- Enums (idempotent — wrapped in DO block to skip if already exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE vacation_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  name  VARCHAR NOT NULL,
  role  user_role NOT NULL DEFAULT 'EMPLOYEE'
);

-- Vacation Requests
CREATE TABLE IF NOT EXISTS vacation_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "employeeId"     UUID NOT NULL,
  "startDate"      DATE NOT NULL,
  "endDate"        DATE NOT NULL,
  reason           VARCHAR,
  type             VARCHAR,
  status           vacation_request_status NOT NULL DEFAULT 'PENDING',
  "managerComment" VARCHAR,

  CONSTRAINT fk_vacation_employee
    FOREIGN KEY ("employeeId") REFERENCES users(id) ON DELETE CASCADE
);

-- OTP Codes
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR NOT NULL,
  code        VARCHAR NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);