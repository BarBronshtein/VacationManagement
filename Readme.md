Vacation Management
Vacation Management is a small full‑stack demo for handling employee vacation requests with role‑based access (Employee vs Manager) and passwordless login via email OTP codes.

Employees submit vacation requests, and managers review, approve, or reject them through a simple web UI.

Stack & Architecture
Frontend

Vue 3 + TypeScript + Vite (SPA).

Router with two main views: AuthView (login/register) and DashboardView (role‑based dashboards).

Composables (useSession, useVacationRequests) encapsulate auth state and API calls.

Backend

Node backend (served on http://localhost:3000) exposing:

Auth endpoints: /api/auth/register, /api/auth/request-otp, /api/auth/verify-otp.

Vacation endpoints: /api/vacation-requests/requests, /api/vacation-requests/pending, /api/vacation-requests/:id/decision.

Uses JWT for stateless auth; frontend decodes the token to populate the current user.

Sends OTP codes via SMTP (Gmail or MailDev) and persists them in the database.

Database (PostgreSQL)

Database: vacation_db.

Tables:

users (id, email, name, role: EMPLOYEE | MANAGER | ADMIN).

vacation_requests (employeeId, start/end dates, reason, type, status, managerComment).

otp_codes (email, code, expiresAt, used).

Local mail testing (MailDev)

MailDev is available as a Docker service:

SMTP port: 1025 (for apps to send mail).

Web UI: http://localhost:1080 to inspect captured emails.

Prerequisites
Docker and Docker Compose installed on your machine.

Node.js (if you want to run the frontend directly instead of via Docker).

A Gmail account if you want to send real OTP emails via Gmail (instead of using MailDev).

Project Structure
At the repo root:

docker-compose.yml – orchestrates Postgres, MailDev, backend, and frontend.

postgres/init.sql – creates DB, enums (user_role, vacation_request_status), and tables.

vacation_frontend/ – Vite + Vue 3 frontend app (login, dashboard, forms, lists).

Configuration
Environment variables (backend)
The backend uses environment variables for DB, JWT, and mail configuration. When running via Docker Compose, these are set in docker-compose.yml. For running the backend directly, .env is provided with the same keys (fill in the values before running).

Key variables:

Database

DATABASE_URL, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SYNCHRONIZE.

JWT

JWT_SECRET.

Mail

MAIL_HOST – e.g. smtp.gmail.com (for Gmail) or maildev (for local MailDev).

MAIL_PORT – 587 for Gmail (TLS) or 1025 for MailDev.

MAIL_USER – your Gmail address.

MAIL_PASS – Gmail app password (see “How to get MAIL_PASS” below).

MAIL_FROM – sender email (usually the same Gmail).

APP_NAME – display name used in email subjects/bodies.

Important: Do not commit your real MAIL_USER / MAIL_PASS to Git.

Running the app with Docker (recommended)
Clone the repository

bash
git clone https://github.com/BarBronshtein/VacationManagement.git
cd VacationManagement
Configure mail settings Decide whether you want to:

Use MailDev (no real emails, good for local testing).

Use real Gmail (actual OTP emails sent to inbox).

See the next section (“Mail setup options”) for specific environment changes.

Start all services

bash
docker compose up --build
This will:

Start Postgres (vacation_db) and run postgres/init.sql.

Build and run the backend on http://localhost:3000.

Build and run the frontend on http://localhost:5173.

Start MailDev on http://localhost:1080 (if configured).

Open the app

Frontend: http://localhost:5173

MailDev (if using): http://localhost:1080

Stop the stack

bash
docker compose down
Mail setup options
Option 1: Local mail testing with MailDev (no real Gmail required)
Use this when you want to test OTP flows without sending real emails.

Backend mail variables Configure the backend to send mail to the MailDev container:

MAIL_HOST=maildev

MAIL_PORT=1025

MAIL_USER / MAIL_PASS / MAIL_FROM can be dummy values; MailDev does not enforce real credentials.

If you are using Docker Compose, set these in the backend service’s environment in docker-compose.yml.

Run Docker Compose

bash
docker compose up --build
Inspect OTP emails

Open http://localhost:1080.

Each login request will create an email containing the OTP code in the MailDev UI.

Option 2: Real OTP emails using Gmail SMTP
Use this when you want users to receive OTP codes in their real Gmail inbox.

1. Enable IMAP in Gmail (once per account)
While IMAP is primarily for reading mail, many guides recommend enabling it when using Gmail with mail clients and app passwords.

Steps:

Sign in to your Gmail account in a browser.

Click the gear icon → See all settings.

Go to the Forwarding and POP/IMAP tab.

Under IMAP access, select Enable IMAP and click Save Changes.

2. Turn on 2‑Step Verification (if not already enabled)
You must have 2‑Step Verification enabled on your Google account to create app passwords.

High‑level steps:

Go to your Google Account → Security.

Under How you sign in to Google, choose 2‑Step Verification and complete the setup (phone verification, etc.).

3. Generate an app password (MAIL_PASS)
MAIL_PASS is a Gmail app password, not your main Google password.

Visit the App passwords page (you may need to sign in): https://myaccount.google.com/apppasswords.

Choose:

App: Mail (or “Other (Custom name)” and type something like VacationManagement).

Device: your choice (or “Other”).

Click Generate to get a 16‑character app password.

Copy this value – this is what you put in MAIL_PASS.

You can revoke or regenerate app passwords any time from the same page.

4. Configure backend mail environment
Set the following values (either in .env if running directly, or in the backend service environment in docker-compose.yml):

text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_gmail_address@gmail.com
MAIL_PASS=the_16_char_app_password_from_step_3
MAIL_FROM=your_gmail_address@gmail.com
APP_NAME=Vacation Management
Gmail’s SMTP server supports TLS on port 587.

Running the frontend without Docker
If you already have the backend running (via Docker or separately), you can run the Vue app directly:

Install dependencies:

bash
cd vacation_frontend
npm install
Start the dev server:

bash
npm run dev
Open http://localhost:5173 in your browser.

The frontend expects the API on http://localhost:3000 (see the hardcoded API_BASE_URL in useSession.ts and useVacationRequests.ts), so if you run the backend on a different host/port you must adjust those constants or inject them via environment variables.

How to use the app
1. Registration
Open http://localhost:5173.

In the Auth page, switch to the Register tab.

Fill in:

Name

Email

Role:

EMPLOYEE – can create vacation requests.

MANAGER – can review and approve/reject requests.

Submit the form; a user record is created in the database.

2. Login (passwordless, via OTP)
In the Login tab, enter your email and click Send OTP.

If using MailDev:

Open http://localhost:1080 and find the email with the OTP code.

If using Gmail:

Open your Gmail inbox and locate the OTP email.

Enter the 6‑digit code in the OTP form and click Verify OTP.

On success:

The backend returns a JWT.

The frontend saves the token in localStorage and cookies, and decodes it to set currentUser.

Subsequent visits will auto‑restore the session as long as the JWT is valid.

3. Employee flow
Once logged in as an EMPLOYEE:

You are redirected to /app and see the Employee Dashboard.

Create a new vacation request:

Fill Start date, End date, and an optional Reason.

Click Submit request.

The request appears in “My requests” with status PENDING.

View your requests:

“My requests” lists all your requests, sorted by start date (newest first).

Each item shows dates, reason, status, and (if rejected) the manager’s comment.

4. Manager flow
Once logged in as a MANAGER:

You are redirected to /app and see the Manager Dashboard.

View pending requests:

“Pending requests” lists all PENDING vacation requests.

Approve a request:

Click approve; status changes to APPROVED.

Reject a request:

Click reject; a modal opens asking for a rejection reason.

Submit a reason; status changes to REJECTED, and the comment is stored.

5. Logout
Click the Logout button in the top‑right bar of the dashboard.

This clears the stored token and redirects you back to the Auth page.

Technical decisions
Vue 3 + <script setup> + TypeScript

Simplified SFC syntax with strong typing and better DX for composables.

Composable‑based auth and requests

useSession centralizes auth state, JWT handling, and OTP flows.

useVacationRequests centralizes all vacation API calls and reactive lists.

JWT stored in both localStorage and cookies

Token is saved to localStorage and a cookie; bootstrap() attempts to restore on page load, and expires cookies based on the token’s exp field.

Role‑based routing

A global navigation guard redirects anonymous users away from /app and prevents authenticated users from going back to /auth while the token is valid.

Postgres with enum types

user_role and vacation_request_status enums enforce valid roles and statuses at the DB level.

MailDev integration for local development

Optional MailDev container allows testing the entire OTP flow without hitting external SMTP.

Known limitations
Backend service discovery

Frontend assumes the API is at http://localhost:3000. Changing the backend host/port requires code changes (no configurable VITE_API_BASE_URL used in the composables yet).

Simplified business logic

No vacation balance tracking, overlapping‑request detection, or approval chains (any manager can see/decide on all pending requests).

Basic security

OTP implementation is minimal and demo‑oriented:

No rate limiting on OTP requests.

No CAPTCHAs or additional throttling.

No admin UI

Role assignment is only done at registration; there is no admin interface to promote/demote users or manage accounts.

Email provider assumptions

README and configuration primarily target Gmail SMTP. Other providers would require manual configuration and are not documented here.

Tips & troubleshooting
If you don’t see OTP emails:

MailDev: confirm MAIL_HOST=maildev and MAIL_PORT=1025, and that the maildev service is up.

Gmail: verify IMAP is enabled, 2‑Step Verification is on, and MAIL_PASS is the latest generated app password.

If you get “password incorrect” with Gmail app password:

Regenerate the app password and update MAIL_PASS; app passwords can be revoked or rotated at any time.