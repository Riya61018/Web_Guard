# SafeGuard — Parental Controls Dashboard

A web app that lets parents **block inappropriate websites** for their children, manage multiple child profiles, and monitor browsing activity — with a real browser extension that enforces the rules.

---

## What It Does

| Feature | Description |
|---------|-------------|
| **Child Profiles** | Create a profile for each child with a name and color |
| **Website Blocking** | Add any domain (e.g. `facebook.com`) to a child's block list |
| **Categories** | Tag blocked sites as Social Media, Gaming, Adult Content, etc. |
| **Toggle Rules** | Temporarily allow a site without deleting the rule |
| **Activity Log** | See every blocked attempt — which child, which site, when |
| **Dashboard** | Live stats: active profiles, total rules, blocks in last 24h |
| **Browser Extension** | Chrome/Firefox extension that actually enforces the rules |

---

## Screenshots

### Dashboard Overview
![Profiles Management](./results/Screenshot%202026-05-23%20110611.png)
*Main dashboard showing key statistics and recent blocked attempts*

### Profile Details
![Profile Details - Blocked Sites](./results/Screenshot%202026-05-23%20110632.png)
*Managing child profile*

### Activity Log View
![Category Filtering](./results/Screenshot%202026-05-23%20110653.png)
*Complete activity log showing all browsing checks and blocks*

### Extension Management
![Activity Log View](./results/Screenshot%202026-05-23%20110719.png)
*Browser extension download and configuration page*


---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| **Backend** | Node.js + Express 5 |
| **Database** | PostgreSQL + Drizzle ORM |
| **API** | REST (contract-first with OpenAPI + Orval codegen) |
| **Routing** | wouter (frontend) |
| **Data fetching** | TanStack Query (React Query) |
| **Package manager** | pnpm workspaces (monorepo) |

---

## Project Structure

```
safeguard/
├── artifacts/
│   ├── api-server/          # Express backend (port 8080)
│   │   └── src/
│   │       ├── routes/      # API routes (profiles, blocked-sites, activity, dashboard, check)
│   │       └── app.ts       # Express app setup
│   └── parental-controls/   # React frontend (port 20460)
│       ├── src/
│       │   ├── pages/       # Dashboard, Profiles, ProfileDetail, Activity, Extension
│       │   └── components/  # UI components and layout
│       └── public/
│           ├── extension/   # Browser extension source files
│           └── extension.zip # Download-ready extension package
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml     # API contract (source of truth)
│   ├── api-client-react/    # Auto-generated React Query hooks
│   ├── api-zod/             # Auto-generated Zod validation schemas
│   └── db/
│       └── src/schema/      # Database tables (profiles, blocked-sites, activity-logs)
└── pnpm-workspace.yaml
```

---

## Prerequisites

Install these before anything else:

- **Node.js 20+** → https://nodejs.org
- **pnpm** → `npm install -g pnpm`
- **PostgreSQL 14+** → https://www.postgresql.org/download

---

## Local Setup (Step by Step)

### 1. Download the code

In Replit: click the **three-dot menu (⋯)** in the file tree → **Download as zip** → unzip it on your computer.

Or clone from GitHub if you've pushed it there:
```bash
git clone https://github.com/yourname/safeguard.git
cd safeguard
```

### 2. Create a PostgreSQL database

```bash
# Open the PostgreSQL shell
psql -U postgres

# Inside the shell, run:
CREATE DATABASE safeguard;
\q
```

### 3. Create a `.env` file

Create a file called `.env` in the **root of the project** (next to `package.json`):

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/safeguard
SESSION_SECRET=change-this-to-any-random-string
NODE_ENV=development
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 4. Install dependencies

```bash
pnpm install
```

### 5. Set up the database tables

```bash
pnpm --filter @workspace/db run push
```

This creates all the tables (`profiles`, `blocked_sites`, `activity_logs`) in your PostgreSQL database.

### 6. Run the app

You need **two terminals** running at the same time:

**Terminal 1 — Backend API (port 8080):**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend (port 20460):**
```bash
pnpm --filter @workspace/parental-controls run dev
```

Open your browser at: **http://localhost:20460**

---

## Using the App

### Dashboard
The home screen shows live stats pulled from the database:
- How many profiles are active
- Total number of blocked site rules
- How many blocks happened in the last 24 hours
- The top blocked category
- A feed of recent blocked attempts

### Profiles
- Click **Profiles** in the left sidebar
- Click **Add Profile** to create a child (name + avatar color)
- Toggle the **Active** switch to pause/resume protection for a child
- Click **Rules** to manage that child's blocked sites
- Delete a profile with the trash icon (all their rules are also deleted)

### Profile Detail (Blocked Sites)
- Enter a domain (e.g. `youtube.com`) and pick a category → **Add Site**
- Use the toggle switch to temporarily allow a site without deleting it
- Use the **Filter by category** dropdown to focus on one type
- Delete rules with the trash icon

**Available categories:**
- Adult Content
- Social Media
- Gaming
- Violence
- Gambling
- Streaming
- Custom

### Activity Log
- Shows every browsing check logged by the browser extension
- Filter by child using the dropdown at the top
- Blocked attempts are highlighted differently from allowed ones

---

## Browser Extension (Enforcement)

The extension is what actually **enforces** the block rules in real time. Without it, the app only stores rules — the extension is what blocks sites.

### How it works
1. Every time a new page loads, the extension reads the domain
2. It calls your SafeGuard API: `GET /api/check?domain=facebook.com&profileId=1`
3. If blocked → the page is instantly replaced with a "Site Blocked" screen
4. The check is also logged to the Activity Log in the dashboard

### Installing the extension

**Step 1:** In the SafeGuard app, click **Extension** in the sidebar → **Download extension.zip**

**Step 2:** Unzip the file on the child's computer

**Step 3 (Chrome):**
1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the unzipped `extension` folder

**Step 4 (Firefox):**
1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select any file inside the unzipped folder

**Step 5:** Open the extension settings:
- Chrome: click the puzzle icon 🧩 in the toolbar → SafeGuard → three-dot menu → **Options**
- Fill in:
   - **SafeGuard API URL**: `http://localhost:8080` (local) or your deployed URL
   - **Profile ID**: Find the child's ID on the Extension page in the app

**Step 6:** Test it — type `facebook.com` in the Test box in extension settings. If it's on the child's block list, it will say **BLOCKED**.

---

## API Endpoints

The backend runs on port **8080** with base path `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/profiles` | List all profiles |
| POST | `/api/profiles` | Create a profile |
| GET | `/api/profiles/:id` | Get one profile |
| PATCH | `/api/profiles/:id` | Update a profile |
| DELETE | `/api/profiles/:id` | Delete a profile |
| GET | `/api/profiles/:id/blocked-sites` | List blocked sites for a profile |
| POST | `/api/profiles/:id/blocked-sites` | Add a blocked site |
| PATCH | `/api/blocked-sites/:id` | Toggle or update a rule |
| DELETE | `/api/blocked-sites/:id` | Delete a rule |
| GET | `/api/activity` | Activity log (filter with `?profileId=&limit=`) |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/check` | **Extension endpoint** — check if a domain is blocked (`?domain=&profileId=`) |

---

## Development Commands

```bash
# Install all dependencies
pnpm install

# Push database schema changes
pnpm --filter @workspace/db run push

# Regenerate API hooks after changing openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# TypeScript check across all packages
pnpm run typecheck

# Run the API server
pnpm --filter @workspace/api-server run dev

# Run the frontend
pnpm --filter @workspace/parental-controls run dev
```

---

## How Blocking Actually Works

```
Child opens browser
       ↓
Extension intercepts page load
       ↓
Calls: GET /api/check?domain=facebook.com&profileId=1
       ↓
API checks blocked_sites table for that profile
       ↓
     Blocked?
    /        \
  YES         NO
   ↓           ↓
Show        Allow page
"Blocked"   to load
  page
   ↓
Log to activity_logs table
```

---

## Deployment (Publishing Online)

To make SafeGuard accessible from anywhere (not just localhost), click **Publish** in Replit — it handles hosting, HTTPS, and domain automatically.

After publishing, update the extension settings on each child's device to use the new public URL (e.g. `https://your-app.replit.app`) instead of `localhost`.

---

## Limitations

- The extension must be installed manually on each browser — it cannot be pushed remotely
- Browser extensions only cover that browser; other apps on the device are not blocked
- If the child uses a different browser without the extension, rules won't be enforced
- For network-wide blocking (all devices, all browsers), consider pairing this with Pi-hole using a DNS export of your block list
