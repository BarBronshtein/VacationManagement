# Vacation Management

[![Status](https://img.shields.io/badge/status-experimental-orange.svg)](./)
[![Tech Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20Postgres%20%7C%20Vue%203-blue.svg)](./)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](./LICENSE)

Vacation Management is a small full‑stack demo for handling employee vacation requests with role‑based access (Employee vs Manager) and passwordless login via email OTP codes.

Employees submit vacation requests, and managers review, approve, or reject them through a simple web UI.

---

## Table of Contents

- [Stack & Architecture](#stack--architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
  - [Environment variables (backend)](#environment-variables-backend)
- [Running the app with Docker](#running-the-app-with-docker-recommended)
- [Mail setup options](#mail-setup-options)
  - [Option 1: Local mail testing with MailDev](#option-1-local-mail-testing-with-maildev-no-real-gmail-required)
  - [Option 2: Real OTP emails using Gmail SMTP](#option-2-real-otp-emails-using-gmail-smtp)
    - [Enable IMAP in Gmail](#1-enable-imap-in-gmail-once-per-account)
    - [Turn on 2‑Step Verification](#2-turn-on-2step-verification-if-not-already-enabled)
    - [Generate an app password (`MAIL_PASS`)](#3-generate-an-app-password-mail_pass)
    - [Configure backend mail environment](#4-configure-backend-mail-environment)
- [Running the frontend without Docker](#running-the-frontend-without-docker)
- [How to use the app](#how-to-use-the-app)
  - [Registration](#1-registration)
  - [Login](#2-login-passwordless-via-otp)
  - [Employee flow](#3-employee-flow)
  - [Manager flow](#4-manager-flow)
  - [Logout](#5-logout)
- [Technical decisions](#technical-decisions)
- [Known limitations](#known-limitations)
- [Tips & troubleshooting](#tips--troubleshooting)

---

## Stack & Architecture

### Frontend

- **Framework:** Vue 3 + TypeScript + Vite.  
- **Routing:** `vue-router` with:
  - `/auth` – authentication (register, request OTP, verify OTP).
  - `/app` – main dashboard, guarded by a JWT‑based auth check.
- **State & data access:**
  - `useSession` composable for auth state and OTP flow.
  - `useVacationRequests` composable for CRUD around vacation requests.
- **UI:**
  - `AuthView`, `DashboardView`, `EmployeeDashboard`, `ManagerDashboard`,
    `VacationRequestForm`, `VacationRequestList`, `PendingReviewList`, `RejectReasonModal`.

### Backend

- **Runtime:** Node.js backend listening on `http://localhost:3000`.
- **Auth:**
  - Endpoints:
    - `POST /api/auth/register`
    - `POST /api/auth/request-otp`
    - `POST /api/auth/verify-otp`
  - Passwordless login via emailed OTP codes.
  - JWT returned from `/verify-otp` and stored on the client.
- **Vacation requests API:**
  - `GET /api/vacation-requests/requests` – current user’s requests.
  - `GET /api/vacation-requests/pending` – manager view of pending requests.
  - `POST /api/vacation-requests/` – create new request.
  - `POST /api/vacation-requests/:id/decision` – approve/reject with optional comment.
- **Mail:**
  - Sends OTP codes via SMTP.
  - Supports MailDev for local testing or Gmail for real emails.

### Database (PostgreSQL)

- Database name: `vacation_db`.
- Schema (see `postgres/init.sql`):
  - `user_role` enum: `EMPLOYEE`, `MANAGER`, `ADMIN`.
  - `vacation_request_status` enum: `PENDING`, `APPROVED`, `REJECTED`.
  - `users` – base user entity.
  - `vacation_requests` – requests linked to `users`.
  - `otp_codes` – one‑time codes with expiry and `used` flag.

### Local mail testing (MailDev)

- Docker service: `maildev`.
- Ports:
  - SMTP: `1025`
  - Web UI: `1080` (`http://localhost:1080`)

---

## Prerequisites

- **Docker** and **Docker Compose**.
- **Node.js** (only required if running the frontend outside Docker).
- A **Gmail** account (optional, only if you want real OTP emails).

---

## Project Structure

```text
VacationManagement/
├─ docker-compose.yml
├─ .env
├─ postgres/
│  └─ init.sql
├─ vacation_frontend/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ App.vue
│  │  ├─ router/
│  │  │  └─ index.ts
│  │  ├─ composables/
│  │  │  ├─ useSession.ts
│  │  │  ├─ useVacationRequests.ts
│  │  │  └─ storage.helper.ts
│  │  ├─ views/
│  │  │  ├─ AuthView.vue
│  │  │  └─ DashboardView.vue
│  │  └─ components/
│  │     ├─ EmployeeDashboard.vue
│  │     ├─ ManagerDashboard.vue
│  │     ├─ VacationRequestForm.vue
│  │     └─ VacationRequestList.vue
└─ vacation/
   └─ ... (backend sources, Dockerfile)
```

---

## Configuration

### Environment variables (backend)

You can configure the backend via:

- The root `.env` file (used when running directly).
- The `backend` service `environment` block in `docker-compose.yml`.

Key variables:

```env
# ─── Database ──────────────────────────────────────────────
DATABASE_URL=postgres://postgres:password@postgres:5432/vacation_db
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=vacation_db
DB_SYNCHRONIZE=true

# ─── JWT ───────────────────────────────────────────────────
JWT_SECRET=my-secret-JWt-Secret!@45-343

# ─── Mail ──────────────────────────────────────────────────
MAIL_HOST=smtp.gmail.com          # or 'maildev' in Docker network
MAIL_PORT=587                     # or 1025 for MailDev
MAIL_USER=ENTER_YOUR_GMAIL
MAIL_PASS=ENTER_YOUR_APP_PASSWORD
MAIL_FROM=ENTER_YOUR_GMAIL
APP_NAME=Vacation Management
```

> **Note:** For security, do **not** commit `.env` with real credentials. Use `.env.example` in public repos.

---

## Running the app with Docker (recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/BarBronshtein/VacationManagement.git
   cd VacationManagement
   ```

2. **Configure mail settings**

   Decide whether to use:

   - [MailDev (local, no real emails)](#option-1-local-mail-testing-with-maildev-no-real-gmail-required), or
   - [Gmail SMTP (real OTP emails)](#option-2-real-otp-emails-using-gmail-smtp).

3. **Start the stack**

   ```bash
   docker compose up --build
   ```

4. **Open the UI**

   - Frontend: `http://localhost:5173`
   - MailDev UI: `http://localhost:1080` (if using MailDev)

5. **Stop everything**

   ```bash
   docker compose down
   ```

---

## Mail setup options

### Option 1: Local mail testing with MailDev (no real Gmail required)

Use this to avoid sending real emails during development.

1. **Set backend mail variables for MailDev**

   In `docker-compose.yml` (backend service):

   ```yaml
   environment:
     MAIL_HOST: maildev
     MAIL_PORT: 1025
     MAIL_USER: dev@example.com
     MAIL_PASS: dev
     MAIL_FROM: dev@example.com
     APP_NAME: Vacation Management (Dev)
   ```

2. **Start Docker Compose**

   ```bash
   docker compose up --build
   ```

3. **Get OTP codes**

   - Open `http://localhost:1080`.
   - Every login request will generate an email containing a 6‑digit code.

---

### Option 2: Real OTP emails using Gmail SMTP

#### 1. Enable IMAP in Gmail (once per account)

1. Sign in to Gmail in your browser.
2. Click the **gear** icon → **See all settings**.
3. Go to the **Forwarding and POP/IMAP** tab.
4. Under **IMAP access**, select **Enable IMAP** and **Save Changes**.

#### 2. Turn on 2‑Step Verification (if not already enabled)

1. Open your **Google Account** → **Security**.
2. Under **How you sign in to Google**, enable **2‑Step Verification**.
3. Complete the setup (phone, SMS, or authenticator app).

#### 3. Generate an app password (`MAIL_PASS`)

1. Visit `https://myaccount.google.com/apppasswords` in your browser.
2. Choose:
   - App: **Mail** (or “Other (Custom name)”, e.g. `VacationManagement`).
   - Device: any value you like.
3. Click **Generate** – Google will show a 16‑character app password.
4. Copy it and keep it safe; this string is your `MAIL_PASS`.

> **Important:** This is **not** your normal Gmail password. It only works for SMTP/IMAP clients and can be revoked at any time.

#### 4. Configure backend mail environment

Update your environment (either `.env` or `docker-compose.yml`):

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=16_char_app_password_from_step_3
MAIL_FROM=your_email@gmail.com
APP_NAME=Vacation Management
```

---

## Running the frontend without Docker

If you want to run only the frontend locally (and point it to an existing backend):

1. **Install dependencies**

   ```bash
   cd vacation_frontend
   npm install
   ```

2. **Start the dev server**

   ```bash
   npm run dev
   ```

3. **Open the app**

   - Visit `http://localhost:5173`.

> The frontend expects the backend at `http://localhost:3000`.  
> If your backend runs elsewhere, adjust the hardcoded `API_BASE_URL` in:
> - `src/composables/useSession.ts`
> - `src/composables/useVacationRequests.ts`

---

## How to use the app

### 1. Registration

1. Go to `http://localhost:5173`.
2. On the **Auth** page, click the **Register** tab.
3. Fill in:
   - **Name**
   - **Email**
   - **Role**
     - `EMPLOYEE` – can create vacation requests.
     - `MANAGER` – can review and approve/reject.
4. Click **Register**.
5. On success, you’ll see a success message; you can now log in with OTP.

### 2. Login (passwordless, via OTP)

1. On the **Auth** page, in the **Login** tab:
   - Enter your email.
   - Click **Send OTP**.
2. Retrieve the code:
   - Using MailDev: open `http://localhost:1080` and open the latest email.
   - Using Gmail: open your inbox for the same email address.
3. Copy the 6‑digit OTP.
4. Paste it in the **OTP Code** field and click **Verify OTP**.
5. On success:
   - You are redirected to `/app`.
   - A JWT is stored (localStorage + cookie) and used for subsequent API calls.

### 3. Employee flow

Once logged in as an `EMPLOYEE`:

- You see the **Employee Dashboard**.

**Create a request**

1. In the **New request** card:
   - Pick **Start date**.
   - Pick **End date**.
   - Optionally fill the **Reason** text area.
2. Click **Submit request**.
3. On success, you’ll see a “Request created.” message, and the request appears in **My requests** with status `PENDING`.

**View my requests**

- **My requests** shows:
  - Date range.
  - Reason.
  - Status (`PENDING`, `APPROVED`, `REJECTED`).
  - If rejected, a “Rejection reason” line.

### 4. Manager flow

Once logged in as a `MANAGER`:

- You see the **Manager Dashboard**.

**Review pending requests**

1. The **Pending requests** card lists all requests with status `PENDING`.
2. For each request, you can:
   - Click **Approve** – sets status to `APPROVED`.
   - Click **Reject** – opens a modal to enter a rejection reason.

**Rejecting with a reason**

1. Click **Reject**.
2. In the modal, type a clear rejection reason.
3. Click **Confirm**:
   - Status becomes `REJECTED`.
   - The comment is stored as `managerComment` and visible to the employee.

### 5. Logout

- In the top bar, click **Logout**.
- This clears the token from storage and redirects back to `/auth`.

---

## Technical decisions

- **Vue 3 + `<script setup>` + TypeScript**
  - Concise syntax and type‑safe components/composables.
- **Composable‑based architecture**
  - `useSession` and `useVacationRequests` encapsulate API concerns and expose only minimal reactive state to components.
- **JWT + localStorage + HTTP‑only‑like cookie**
  - Tokens are:
    - Saved in localStorage (simple persistence).
    - Mirrored to a cookie with expiration aligned to JWT `exp`.
  - On app bootstrap, token is read back and validated before restoring the session.
- **Postgres enums and foreign keys**
  - DB enforces valid values and referential integrity (e.g. `vacation_requests.employeeId` references `users.id`).
- **MailDev integration**
  - Dockerized mail catcher for local dev, no external dependencies.
- **Simple, role‑based routing**
  - Global guard on router:
    - Redirects `/app` to `/auth` if not authenticated.
    - Redirects `/auth` to `/app` if already authenticated and token not expired.

---

## Known limitations

- **Backend discovery**
  - Frontend assumes backend is at `http://localhost:3000` and does not yet use `VITE_API_BASE_URL` for dynamic configuration.
- **Business rules**
  - No vacation balance/allowance logic.
  - No overlap detection for conflicting vacations.
  - Any manager can see all pending requests; no per‑team scoping.
- **Security**
  - No rate limiting on OTP endpoints.
  - No CAPTCHA or anti‑abuse measures.
  - Demo JWT secret in `.env` – replace in production.
- **Admin tooling**
  - No admin UI for managing users, roles, or system settings.
- **Email providers**
  - Only Gmail and MailDev are documented. Other SMTP providers may require additional configuration (TLS, ports, auth).

---

## Tips & troubleshooting

- **No OTP email in MailDev**
  - Check:
    - `MAIL_HOST=maildev`
    - `MAIL_PORT=1025`
    - `maildev` container is running.
- **No OTP email in Gmail**
  - Verify:
    - IMAP enabled in Gmail settings.
    - 2‑Step Verification enabled.
    - App password (`MAIL_PASS`) is valid and copied correctly.
- **“Authentication failed” from Gmail**
  - Regenerate an app password and update `MAIL_PASS`.
  - Wait up to a minute and retry; old app passwords stop working immediately when revoked.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.