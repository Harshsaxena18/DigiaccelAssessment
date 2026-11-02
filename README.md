# 📝 Modern To-Do List Application (MERN Stack)

> A fullstack, mobile-first, and responsive To-Do List application built for the **SDE-1 (MERN Stack) Assessment**, adhering strictly to the provided Figma design specifications, weekly scheduling logic, and engineering requirements.

---

## 🌟 Key Highlights & Features

- **📱 Figma-Accurate Mobile & Web Experience:**
  - Faithfully reproduces the typography, color palette (Royal Blue `#3B5BFD`, soft `#EBF3FF` & `#FFF0F0` summary cards), and component states from the Figma design.
  - Features an intuitive **Horizontal Day Selector** (`Mon` to `Sun`) with active indicators.
  - Dynamic **Weekly Progress** bar tracking live task completion ratios.
  - Adapts into an ergonomic **Desktop Dashboard view** on wider viewports without stretching or layout breakage.
  - Includes the Figma **Onboarding Screen** ("Manage What To Do").

- **📅 Strict Weekly Organization (Monday – Sunday):**
  - All tasks belong to a specific week beginning on **Monday 00:00:00** and ending **Sunday 23:59:59.999** in the user's browser timezone.
  - Expandable week cards display live **Open** (`IN_PROGRESS`) and **Completed** counts.
  - Status updates and date edits automatically recalculate week totals in real time.

- **⚡ End-to-End Task Management (CRUD):**
  - **Create Task:** Mandatory `Title` & `Date/Time`, optional `Priority` (`Low`, `Medium`, `High`) and `Description`.
  - **Edit Task:** Pre-filled reusable modal/sheet supporting all attributes.
  - **Status Toggling:** One-tap checkbox transitions between `In Progress` and `Completed` with instant strikethrough styling and count sync.
  - **Delete Task:** Accessible touch swipe-left interaction on mobile + desktop action button with confirmation dialog.

- **🔍 Global Keyword Search (Figma Frame 9):**
  - Real-time search across task `title` and `description` with a 300ms debounce.
  - Search results allow direct status toggle, edit, and deletion.

---

## 🏗️ Architecture & Tech Stack

```text
todo-list-app/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── app/                # App shell & React Query client
│   │   ├── components/         # Header, Dialogs, Onboarding
│   │   ├── features/tasks/     # Feature-oriented tasks module
│   │   │   ├── api/            # API client with error normalization
│   │   │   ├── components/     # WeekCard, TaskItem, TaskModal, SearchView, etc.
│   │   │   ├── hooks/          # TanStack Query hooks & mutations
│   │   │   └── utils/          # Monday-Sunday & timezone math
│   │   └── pages/              # Master HomePage
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # Environment & Database connection
│   │   ├── middleware/         # Centralized ErrorHandler, NotFound, ValidateRequest
│   │   ├── modules/tasks/      # Task model, Zod validation, controller, service, routes
│   │   ├── utils/              # ApiError & asyncHandler helpers
│   │   ├── app.js              # Express app construction
│   │   └── server.js           # Database boot & server listening
│   ├── tests/                  # Integration tests (Vitest + Supertest)
│   └── package.json
│
├── package.json                # Root orchestration runner
└── README.md
```

### Stack Summary
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, TanStack Query v5, Date-fns v4.
- **Backend:** Node.js (ES Modules), Express v4, Mongoose v8, Zod, Helmet, CORS.
- **Database:** MongoDB with automated aggregation via `$dateTrunc`.
- **Testing:** Vitest, React Testing Library, Supertest, MongoMemoryServer.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) OR MongoDB Atlas URI. *(Note: If no database is detected, the server seamlessly runs with an in-memory database fallback for effortless evaluation).*

### 1. Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration
Both `server/` and `client/` have `.env.example` templates pre-configured:

**Server (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_list
CLIENT_ORIGIN=http://localhost:5173
```

**Client (`client/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Run Locally

**Start Backend Server:**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Start Frontend Application (in a new terminal):**
```bash
cd client
npm run dev
# Vite dev server starts at http://localhost:5173
```

Alternatively, from the project root:
```bash
npm run dev:server
npm run dev:client
```

---

## 🧪 Running Automated Tests

Both frontend and backend are thoroughly tested with Vitest.

### Backend Integration Tests:
```bash
cd server
npm test
```
*Covers:* CRUD operations, status toggling, week boundary calculations (Monday 00:00:00 to Sunday 23:59:59), keyword search, input validation, and 404/400 safety guards.

### Frontend Component & Date Engine Tests:
```bash
cd client
npm test
```
*Covers:* Summary cards rendering, progress calculation, task item interactions, form validation, date timezone conversions, and week boundary math.

### Production Build:
```bash
cd client
npm run build
```

---

## 📡 REST API Contract (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check & system uptime |
| `GET` | `/api/v1/tasks/weekly-summary?timezone=...` | Monday–Sunday weekly counts (`openCount`, `completedCount`) |
| `GET` | `/api/v1/tasks` | List tasks (supports `search`, `status`, `from`, `to`, `page`, `limit`) |
| `POST` | `/api/v1/tasks` | Create a task (requires `title` & `scheduledAt`) |
| `GET` | `/api/v1/tasks/:id` | Fetch task by ID |
| `PATCH` | `/api/v1/tasks/:id` | Update task details |
| `PATCH` | `/api/v1/tasks/:id/status` | Update task status (`IN_PROGRESS` ↔ `COMPLETED`) |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task (`204 No Content`) |

---

## 📐 Design & Figma Alignment

| Figma Element | Implementation |
|---|---|
| **Onboarding Frame** | Implemented with SVG wave vectors, brand blue header, and "Manage What To Do" card. |
| **Home Frame** | Search bar, horizontal Mon–Sun day strip with active dot, Task Complete/Pending cards, Progress bar, Task rows with checkboxes & action buttons, Floating `+` button. |
| **New Task Modal** | Bottom sheet on mobile / modal on desktop with Title, Date/Time picker, Low/Medium/High priority pills, and Description. |
| **Search Frame 9** | Dedicated search view with back navigation, real-time debounced query, and result item actions. |
| **Web Responsive** | Elegantly expands from a mobile-first column to an executive dashboard view on tablet & desktop widths. |

---

## 🛡️ Security & Engineering Best Practices

- **Strict Input Validation:** Zod schemas validate all route params, query parameters, and request payloads before hitting database services.
- **Standardized Error Responses:** Centralized error handler outputs consistent error objects (`code`, `message`, `details`) with no leaked stack traces in production.
- **Safe Database Queries:** Regex queries are sanitized and escaped to prevent ReDoS or operator injection attacks.
- **Security Headers & CORS:** Helmet security headers and strict origin configuration.
- **Graceful Shutdown:** Process handlers for `SIGTERM`/`SIGINT` to gracefully disconnect MongoDB connections.
