# To-Do List Web Application

A full-stack MERN task management application featuring weekly task grouping, progress tracking, status toggling, and global search. Designed with a mobile-first responsive interface that scales cleanly to desktop viewports.

---

## Features

- **Weekly Task Organization:** Automatically groups tasks by week (Monday 00:00 through Sunday 23:59) based on the client's local timezone.
- **Weekly Progress & Metrics:** Real-time counters for completed and open tasks with a dynamic completion progress indicator.
- **Task Management (CRUD):**
  - Create tasks with mandatory title and date/time, plus optional priority (`Low`, `Medium`, `High`) and description.
  - Edit existing tasks via a unified form modal.
  - Toggle status between `In Progress` and `Completed` with instant strikethrough styling and count recalculation.
  - Delete tasks with touch swipe-to-delete on mobile or desktop action buttons with a confirmation prompt.
- **Keyword Search:** Debounced real-time search across task titles and descriptions with direct action controls on search results.
- **Responsive Layout:** Clean mobile-first UI with smooth micro-interactions (powered by Tailwind CSS and Framer Motion) that adapts to a desktop dashboard view on wider screens.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, TanStack Query v5, Axios, Date-fns.
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, Zod, Helmet, CORS.
- **Testing:** Vitest, React Testing Library, Supertest, MongoMemoryServer.

---

## Project Structure

```text
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── api/                # Axios client with interceptors
│   │   ├── app/                # App shell & React Query provider
│   │   ├── components/         # Shared UI components (Header, Dialogs, Modals)
│   │   ├── features/tasks/     # Feature-oriented tasks module
│   │   │   ├── api/            # Task API requests
│   │   │   ├── components/     # Week cards, task items, modals, search
│   │   │   ├── hooks/          # React Query query & mutation hooks
│   │   │   └── utils/          # Monday-Sunday calendar & timezone helpers
│   │   └── pages/              # Main application page
│   └── package.json
│
├── server/                     # Backend Express API
│   ├── src/
│   │   ├── config/             # Database connection & environment setup
│   │   ├── middleware/         # Central error handler, request validator, 404
│   │   ├── modules/tasks/      # Mongoose schema, validation, controller, service, routes
│   │   ├── utils/              # ApiError & asyncHandler utilities
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entrypoint & graceful shutdown
│   ├── tests/                  # Integration test suite
│   └── package.json
│
└── package.json                # Root package for running scripts
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or a remote MongoDB Atlas URI. *(Note: If no local database is running, the server automatically starts an in-memory MongoDB instance for development).*

### 1. Installation

Install dependencies for both client and server:

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Create `.env` files in both directories based on the provided `.env.example` templates:

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

### 3. Running the Application

**Start the Backend:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Start the Frontend:**
```bash
cd client
npm run dev
# Client running at http://localhost:5173
```

---

## Running Tests

### Backend Integration Tests:
```bash
cd server
npm test
```
Tests cover:
- Health check endpoint
- Task creation and input validation
- Single task retrieval and 404/400 error handling
- Partial task updates
- Status toggling between `IN_PROGRESS` and `COMPLETED`
- Task deletion
- Case-insensitive keyword search
- Date range filtering
- Monday-to-Sunday weekly aggregation

### Frontend Component & Date Engine Tests:
```bash
cd client
npm test
```
Tests cover:
- Summary card count formatting
- Progress bar calculations and edge cases
- Task item checkbox toggling and action triggers
- Form validation for mandatory fields
- Date and timezone boundary calculations

---

## API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check endpoint |
| `GET` | `/api/v1/tasks/weekly-summary?timezone=...` | Weekly summary aggregated by Monday–Sunday weeks |
| `GET` | `/api/v1/tasks` | List tasks (supports `search`, `status`, `from`, `to`, `page`, `limit`, `sort`) |
| `POST` | `/api/v1/tasks` | Create a new task |
| `GET` | `/api/v1/tasks/:id` | Get task by ID |
| `PATCH` | `/api/v1/tasks/:id` | Update task fields |
| `PATCH` | `/api/v1/tasks/:id/status` | Update task status |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task |
