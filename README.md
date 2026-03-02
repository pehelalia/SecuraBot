# SecuraGov Workspace

This repository contains two main services:

- **secura-gov**: Frontend application built with React, Vite, TypeScript, and Tailwind CSS.
- **api**: Backend service using Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Getting Started

1. **Frontend**
   ```bash
   cd secura-gov
   # use cmd if you encounter PowerShell policy errors:
   cmd /c "npm install"
   cmd /c "npm run dev"
   ```

2. **Backend**
   ```bash
   cd api
   cmd /c "npm install"
   cmd /c "npm run dev"
   ```

Development tasks are available via the VS Code `dev: all` task.

## Notes

- Tailwind CSS has a custom theme defined in `tailwind.config.js`.
- Prisma schema is located in `api/prisma/schema.prisma`.
- Environment variables should be configured in `api/.env`.

### Mock credentials
The frontend uses a simple in‑memory authentication helper; use any of the following username/password pairs to log in. All passwords are `Password!1`.

| Username   | Role             |
|------------|------------------|
| viewer1    | viewer           |
| guest1     | guest            |
| employee1  | employee         |
| analyst1   | analyst          |
| manager1   | manager          |
| approver1  | approver         |
| secadmin   | security_admin   |
| platform   | platform_admin   |

Once authenticated you will be redirected to the dashboard. The dashboard adapts to your role:

- **viewer/guest** – read‑only, no search bar, limited cards, cannot create requests or access resource detail pages.
- **employee/analyst/manager** – can submit new modification requests using the “New Request” button.
- **manager/approver** – additionally see an “Approve Requests” action for reviewing requests.
- **security_admin/platform_admin** – full access including the **Manage Users** page where new users can be added or removed.

On the dashboard header the current user ID and role are shown in the top‑right corner.

## PDF Export

The UI now includes **Download PDF** buttons on the dashboard and logs page. When clicked these buttons capture the visible data (charts, tables, etc.) and generate a PDF file using `html2canvas` and `jspdf` for easy reporting.

## Login Security

To mitigate brute‑force attempts, the login page tracks consecutive failures. After **three incorrect login attempts**, the form is disabled and the user is placed on a short timeout (1 minute by default); the remaining lockout time is displayed. Successful authentication resets the counter.

All failed logins (and any attempts during a lockout) are recorded in the application audit log so administrators can review suspicious activity via the **Logs** page. The log entry type will be `failed_login` or `lockout` with the user ID and a timestamp. The logs table now shows columns for time, event type, associated request (if any), actor, and an optional message for extra context.

## Anomaly Detection

The request submission system automatically detects unusual access patterns:

- **Off-hours requests**: Flagged if submitted outside 9 AM – 5 PM on weekdays (🌙 Off-hours)
- **High frequency**: Flagged if a user submits 5+ requests within a 1-hour window (⚡ High frequency)

When anomalies are detected during request submission, users see a warning with details and must acknowledge before proceeding. All flagged requests are recorded in the audit log with anomaly metadata, allowing administrators to review suspicious activity. Flags are visible in the **Logs** page under the "Flags" column.

### Risk Level Assessment

Each log entry is assigned a **Risk Level** badge with color coding:

- 🟢 **Low** (green): Normal requests or standard events with no anomalies
- 🟠 **Moderate** (orange): Requests with one anomaly detected (off-hours OR high frequency)
- 🔴 **High** (red): Requests with multiple anomalies (off-hours AND high frequency) or security events (failed logins, lockouts)

Administrators can quickly scan the logs to identify high-risk activities requiring investigation.

## Request Approval Workflow

The **Approve Requests** page displays a queue of pending requests waiting for review. Managers and approvers can:

1. View pending requests with their risk level and any anomalies
2. Click **Review & Decide** to open the request details page
3. View complete request information (who requested, when, anomalies, etc.)
4. Add optional feedback notes
5. Click **Approve** or **Deny** to record the decision

All approval/denial decisions are logged in the audit trail with timestamps and the approver's ID. Pending requests are filtered out once a decision is made.
