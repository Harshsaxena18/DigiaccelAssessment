# AI Agent Implementation Spec — To-Do List App (MERN)

> **Purpose:** Build the SDE-1 MERN To-Do List assignment as a clean, responsive, working application with a small and maintainable codebase. This document is the implementation brief for the coding agent.
>
> **Priority:** Match the supplied assignment and Figma design first. Use the engineering guidance below to make the implementation reliable without turning a small assessment into an over-engineered platform.

---

## 1. Assignment source and scope

The source assignment is **SDE-1 (MERN Stack) Assessment.pdf**. It requires a fully responsive To-Do List application with task CRUD, keyword search, weekly grouping (Monday through Sunday), open/completed weekly counts, expandable week cards, and task status changes. It asks for a mobile UI based on the supplied Figma design, a GitHub repository, and awards additional points for a deployed solution and a custom API.

### Figma reference — visual source of truth

Use this Figma file as the visual reference:

[To-Do List Mobile App — Figma](https://www.figma.com/design/mz2PJoTwa5DxYrdrFPem3f/To-Do-List-Mobile-app?node-id=0-1&t=7XVtCMzMmLV08Avn-1)

The Figma file could not be opened in the document-authoring environment. **Before implementing the UI, open the link in the development environment and inspect the actual frames, typography, colors, spacing, icons, and component states.** Do not invent a different visual direction when the reference is available. If access is blocked, implement a restrained mobile-first design and record the access limitation in the README.

### 1.1 Required features from the assessment

| Area | Required behavior |
|---|---|
| Create task | Create a task with a mandatory title and date/time; description is optional; priority is optional and supports Low, Medium, High. |
| Edit task | Update title, description, date/time, and priority. |
| Delete task | Delete a task. The described mobile flow is swipe left, then tap Delete. |
| Search | Search by keywords in task title and description. Search results must allow view, edit, and delete. |
| Weekly organization | Group tasks into weeks. A week starts Monday and ends Sunday. |
| Weekly summary | Each week shows the number of open tasks and completed tasks. |
| Expand week | Selecting a week card expands it and displays that week's tasks. |
| Status | A task can be In Progress or Completed. A status change must update the weekly totals. |
| Responsive UI | Build a fully responsive mobile UI, with Tailwind CSS permitted. |
| Delivery | Submit a GitHub repository. A deployed app and a custom API are additional advantages. |

### 1.2 Keep the solution deliberately small

Build **one focused To-Do application**, not a generic project-management suite.

Do not add these items unless they are present in the Figma file or explicitly requested later:

- Subtasks, labels, tags, attachments, comments, recurring tasks, reminders, notifications, calendar integrations, drag-and-drop planning, team collaboration, or role management.
- Separate admin dashboards or analytics pages.
- A complex authentication, registration, password reset, or social-login flow. Authentication is not specified in the assessment. See the deployment/security note in Section 12 before exposing a public API.
- Redux, microservices, event-driven architecture, repository abstractions, or a large design-system framework merely for appearance of enterprise readiness.

**Engineering principle:** Keep the feature set simple and make the selected features correct, accessible, testable, and easy to maintain.

---

## 2. Implementation decisions and assumptions

Use the following defaults unless the repository already has a consistent implementation that should be preserved.

| Concern | Decision |
|---|---|
| Application type | Single-user assessment/demo app; no sign-in flow by default because the source assignment does not request one. |
| Frontend | React + Vite + JavaScript. |
| Styling | Tailwind CSS; use small reusable components and design tokens from Figma. |
| Backend | Node.js + Express. |
| Database | MongoDB with Mongoose. |
| API style | REST JSON API under `/api/v1`. |
| Task status | `IN_PROGRESS` or `COMPLETED`. A newly created task defaults to `IN_PROGRESS`. |
| Priority | `LOW`, `MEDIUM`, `HIGH`, or `null` when not selected. |
| Date/time storage | Store one UTC instant in MongoDB as `scheduledAt`; display and edit it in the browser's local timezone. |
| Week definition | Monday 00:00 through the following Monday 00:00 in the browser's local timezone. The end boundary is exclusive. |
| Default sort | Tasks ordered by `scheduledAt` ascending within a week. Search results ordered by the most relevant/nearest scheduled date, or by `scheduledAt` ascending if relevance ranking is not implemented. |
| State management | TanStack Query for API/server state; ordinary React state for open panels, dialogs, and other local UI state. Do not add Redux for this app. |
| Forms | React Hook Form + Zod, or a similarly small and consistent validation approach. Do not duplicate complex validation logic in multiple components. |
| Tests | Vitest; React Testing Library for frontend tests; Supertest for API integration tests. |

### 2.1 Important interpretation: Open vs. In Progress

The assessment uses both **Open** and **In Progress** language. Treat them as the same logical state:

- `IN_PROGRESS` = open task.
- `COMPLETED` = completed/closed task.

Do not create a third `OPEN` status. The UI may label `IN_PROGRESS` as **In Progress** in a task row and count it under **Open** in the weekly summary.

### 2.2 Important interpretation: Date and time

- The mandatory date/time field is the task's scheduled date and time, represented by `scheduledAt`.
- Use a `datetime-local` input or the Figma-specified equivalent.
- Convert the local input value into a valid JavaScript `Date`, then send `toISOString()` to the API.
- When editing, convert the stored UTC instant back into the browser's local `datetime-local` value. Do not pass an ISO string directly to `datetime-local` without conversion.
- Group tasks using the browser's local timezone, not the server machine's timezone and not UTC calendar dates.
- Pass the browser timezone to the weekly-summary API using `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- Test Monday/Sunday boundaries and daylight-saving transitions. Do not assume every local day is exactly 24 hours.

---

## 3. User experience and screen behavior

### 3.1 Main/home screen

The home screen is the main experience. It should make it immediately clear what tasks are scheduled and how each week is progressing.

Required elements:

1. App header/title matching the Figma reference.
2. Search entry point, typically a search icon or search field as shown in Figma.
3. Add Task action.
4. A vertically organized list of weekly summary cards/sections.
5. Each week shows:
   - Week date range, formatted clearly (for example, `26 Oct – 1 Nov`).
   - Open task count.
   - Completed task count.
   - An obvious expand/collapse affordance.
6. Selecting a week expands that week and displays its tasks.
7. Each task shows the information needed to identify and act on it. At minimum, show its title, scheduled date/time, status, and priority when provided. Show description only if the Figma layout has room or when opening task details.
8. A helpful empty state when no tasks exist, with a clear Add Task action.

Do not show fake chart data, hard-coded counts, or sample tasks in the final running application. Seed data may be used only for local development and must be clearly separated from production data.

### 3.2 Weekly grouping and expansion

- Week begins on **Monday** and ends on **Sunday**.
- Use local calendar dates for week labels and boundaries.
- Each task belongs to exactly one week based on its `scheduledAt` value in the user's local timezone.
- A task scheduled on Sunday belongs to the week ending that Sunday. A task scheduled on the immediately following Monday belongs to the next week.
- The weekly summary counts all tasks in that week, independent of whether the week is expanded.
- `openCount` is the number of `IN_PROGRESS` tasks.
- `completedCount` is the number of `COMPLETED` tasks.
- A status update must refresh the relevant task list and summary without requiring a full page reload.
- Editing a task's scheduled date/time may move it to another week. Both the old and new week summaries must update.
- Deleting a task must update the week count and expanded list.

Suggested interaction: allow one week to be expanded at a time to keep the interface compact. If the supplied Figma clearly supports multiple expanded weeks, follow the design instead.

If no tasks exist in a week, do not create an endless list of empty week cards. Display weeks that contain tasks and optionally the current week as an empty section, based on the Figma reference.

### 3.3 Create task

The Add Task action opens the form using the presentation shown in Figma (modal, bottom sheet, or dedicated screen).

Fields:

| Field | Required | Rules |
|---|---:|---|
| Title | Yes | Trim whitespace; reject empty text; maximum 120 characters. |
| Description | No | Trim surrounding whitespace; maximum 2,000 characters. Empty description is stored as an empty string or `null` consistently. |
| Date & Time | Yes | Must parse to a valid date/time. |
| Priority | No | One of `LOW`, `MEDIUM`, `HIGH`, or no selection. |

Behavior:

- Show inline validation close to the relevant field.
- Disable or guard duplicate submission while the save request is in progress.
- On success, close the form, refresh weekly summaries, and make the newly scheduled task visible in its week.
- On failure, keep the form open, preserve entered values, and show a useful error message.
- Do not clear the form before the API confirms success.
- Use clear Save and Cancel actions.

### 3.4 Edit and view task

- Selecting a task should provide a way to view its details and edit it, consistent with the Figma interaction.
- Reuse the create-task form for editing where practical. Avoid maintaining two nearly identical forms.
- Prefill all fields correctly, including local date/time conversion and optional priority.
- Save only changed values if using PATCH; the backend must still validate the resulting task state.
- On successful edit, update the task list and all affected weekly summaries.
- Cancel must discard unsaved changes and return to the previous state.

### 3.5 Delete task

- On touch devices, support the assessment's swipe-left interaction to reveal a Delete action.
- The Delete action must remain available through a visible menu/button or equivalent keyboard-accessible control. Swipe must not be the only way to delete.
- Confirm destructive deletion with a small confirmation dialog, unless the Figma explicitly defines a different confirmation pattern.
- Prevent repeated delete requests while a request is in progress.
- On success, remove the task from the UI and refresh the corresponding weekly count.
- On failure, keep the task visible and show an error.

### 3.6 Search

- Search across task `title` and `description`.
- Search should include tasks from all weeks, not only the currently expanded week.
- Debounce input by approximately 250–350 ms to avoid one request per keystroke.
- Cancel or disregard stale requests so that a slow older response cannot replace newer results.
- Show a loading state, no-results state, and recoverable error state.
- Each result must support view, edit, and delete.
- Clearing the search returns the user to the home/weekly view without losing unrelated app state.
- Trim leading/trailing whitespace. An empty query should behave as no search filter.

### 3.7 Status change

- Provide a clear action to switch a task between `IN_PROGRESS` and `COMPLETED`.
- The UI should communicate the current state using text and not color alone.
- On success, update the task row and weekly counts immediately through a cache update or query invalidation.
- If the update fails, restore the prior state and show an error. Optimistic updates are optional; correctness is mandatory.

### 3.8 Responsive layout

Mobile is the primary target, but the app must work at phone, tablet, and desktop widths.

- Avoid horizontal page scrolling at common viewport widths.
- Keep touch targets comfortably sized (aim for at least 44 × 44 CSS pixels where practical).
- Forms must fit within the viewport and remain usable with the on-screen keyboard open.
- On wider screens, use the available space sensibly without stretching task content into unreadable lines.
- Keep all actions usable with keyboard and screen readers.
- Respect reduced-motion preferences for animated expand/collapse or swipe affordances.

---

## 4. Data model

Use one primary MongoDB collection: `tasks`.

### 4.1 Task document

```js
{
  _id: ObjectId,
  title: String,             // required, trimmed, 1–120 characters
  description: String,       // optional, trimmed, max 2,000 characters
  scheduledAt: Date,         // required UTC instant
  priority: String | null,   // LOW | MEDIUM | HIGH | null
  status: String,            // IN_PROGRESS | COMPLETED
  createdAt: Date,
  updatedAt: Date
}
```

Recommended Mongoose rules:

- `timestamps: true`.
- `title`: `required`, `trim`, `minlength: 1`, `maxlength: 120`.
- `description`: `trim`, `maxlength: 2000`, default `''` (or use `null`, but choose one representation consistently).
- `scheduledAt`: required date.
- `priority`: enum `LOW`, `MEDIUM`, `HIGH`; allow `null`.
- `status`: enum `IN_PROGRESS`, `COMPLETED`; default `IN_PROGRESS`.
- Use Mongoose schema validation, but do not rely on it as the only input validation layer. Validate request bodies and query parameters before calling the model.

### 4.2 Indexes

Create only indexes that support actual access patterns:

- `{ scheduledAt: 1, status: 1 }` for weekly filtering/summary workloads.
- A text index on `{ title: 'text', description: 'text' }` if using MongoDB `$text` search.

Avoid adding many speculative indexes. Check actual query plans if the dataset grows.

### 4.3 Data ownership and authentication caveat

The source assessment does not define accounts or multiple users. Do not invent a full account system in the baseline implementation.

However, an unauthenticated public API allows anyone who can reach it to read, create, update, or delete its tasks. Before using the deployment with real personal data, add authentication and enforce task ownership on every query. Never describe an unauthenticated demo deployment as production-secure.

---

## 5. REST API contract

Base path: `/api/v1`.

Use JSON request/response bodies. Return appropriate HTTP status codes and a consistent response shape.

### 5.1 Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | Health check for deployment. |
| `GET` | `/api/v1/tasks` | List tasks; supports search, status, date-range filters, and pagination. |
| `GET` | `/api/v1/tasks/weekly-summary` | Return per-week open/completed counts in the requested timezone. |
| `GET` | `/api/v1/tasks/:id` | Fetch one task. |
| `POST` | `/api/v1/tasks` | Create a task. |
| `PATCH` | `/api/v1/tasks/:id` | Update task fields. |
| `PATCH` | `/api/v1/tasks/:id/status` | Update task status. |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task. |

Register static routes such as `/weekly-summary` before `/:id` so Express does not interpret the static name as an ID.

### 5.2 List and search query parameters

`GET /api/v1/tasks`

| Parameter | Meaning |
|---|---|
| `search` | Optional keyword search in title and description. |
| `status` | Optional `IN_PROGRESS` or `COMPLETED` filter. |
| `from` | Optional inclusive ISO timestamp lower bound for `scheduledAt`. |
| `to` | Optional exclusive ISO timestamp upper bound for `scheduledAt`. |
| `page` | Optional page number; default `1`. |
| `limit` | Optional page size; default `20`, maximum `100`. |
| `sort` | Optional supported sort, e.g. `scheduledAt:asc` or `scheduledAt:desc`. Reject unsupported values. |

Example:

```http
GET /api/v1/tasks?search=interview&page=1&limit=20
```

Use a text index and `$text` search, or a carefully escaped and bounded search implementation. Never inject user-provided strings directly as MongoDB operators or raw regular expressions.

### 5.3 Weekly summary

`GET /api/v1/tasks/weekly-summary?timezone=Asia%2FKolkata`

Return one summary per week containing tasks. The week must be calculated in the requested IANA timezone and start on Monday. Use a supported MongoDB aggregation such as `$dateTrunc` with `unit: 'week'`, `startOfWeek: 'Monday'`, and the requested timezone, or an equally correct implementation.

Example response:

```json
{
  "data": [
    {
      "weekStart": "2026-10-26T00:00:00.000Z",
      "openCount": 4,
      "completedCount": 2,
      "totalCount": 6
    }
  ]
}
```

`weekStart` is an instant representing the local Monday boundary; format it in the same timezone used for the request. Do not assume the serialized UTC clock time will always be midnight in every timezone.

The client should derive each displayed week's local `from` and exclusive `to` boundaries with a tested date utility. When a week is expanded, fetch that week's tasks using those boundaries:

```http
GET /api/v1/tasks?from=<week-start-iso>&to=<next-week-start-iso>&page=1&limit=100
```

If a week can contain more than 100 tasks, provide pagination or increase the bounded limit deliberately; never silently imply that a truncated list is complete.

### 5.4 Create request

`POST /api/v1/tasks`

```json
{
  "title": "Prepare assessment submission",
  "description": "Review the API and UI before sharing the repository.",
  "scheduledAt": "2026-11-04T10:30:00.000Z",
  "priority": "HIGH"
}
```

The server sets:

- `status` to `IN_PROGRESS` for a new task.
- `createdAt` and `updatedAt` through Mongoose timestamps.

Do not trust client-provided `_id`, `status`, `createdAt`, or `updatedAt` in the create body. Ignore or reject unexpected fields.

### 5.5 Update request

`PATCH /api/v1/tasks/:id`

```json
{
  "title": "Prepare final assessment submission",
  "description": "Check the UI, API, and README.",
  "scheduledAt": "2026-11-04T11:00:00.000Z",
  "priority": "MEDIUM"
}
```

- Support partial updates.
- Reject an empty update body.
- Validate each supplied property and the resulting document.
- Do not permit clients to update `_id`, `createdAt`, or arbitrary internal properties.
- If `priority` is intentionally cleared, allow `null`.

### 5.6 Status request

`PATCH /api/v1/tasks/:id/status`

```json
{
  "status": "COMPLETED"
}
```

Only accept `IN_PROGRESS` and `COMPLETED`.

### 5.7 Delete

`DELETE /api/v1/tasks/:id`

Return `204 No Content` on success. Return `404` if the task does not exist.

### 5.8 Response and error format

Successful resource response:

```json
{
  "data": {
    "_id": "...",
    "title": "Prepare assessment submission",
    "description": "Review the API and UI before sharing the repository.",
    "scheduledAt": "2026-11-04T10:30:00.000Z",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "createdAt": "2026-11-02T12:00:00.000Z",
    "updatedAt": "2026-11-02T12:00:00.000Z"
  }
}
```

Paginated response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalItems": 0,
    "totalPages": 0
  }
}
```

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": [
      { "field": "title", "message": "Title is required." }
    ]
  }
}
```

Use consistent error codes such as `VALIDATION_ERROR`, `NOT_FOUND`, `BAD_REQUEST`, `RATE_LIMITED`, and `INTERNAL_ERROR`. Do not send stack traces, database details, or secrets to the browser.

### 5.9 HTTP status codes

- `200 OK`: successful reads and updates.
- `201 Created`: successful creation.
- `204 No Content`: successful deletion.
- `400 Bad Request`: invalid input/query parameters.
- `404 Not Found`: missing task or route.
- `429 Too Many Requests`: rate limit exceeded, where rate limiting is configured.
- `500 Internal Server Error`: unexpected server error.

---

## 6. Frontend structure and implementation guidance

Keep the frontend feature-oriented and avoid creating a component for every tiny markup fragment.

Suggested structure:

```text
client/
  src/
    app/
      App.jsx
      queryClient.js
    components/
      AppHeader.jsx
      EmptyState.jsx
      ErrorState.jsx
      LoadingState.jsx
      ConfirmDialog.jsx
    features/
      tasks/
        api/
          tasksApi.js
        components/
          TaskForm.jsx
          TaskItem.jsx
          TaskList.jsx
          WeekCard.jsx
          WeekList.jsx
          SearchPanel.jsx
        hooks/
          useTasks.js
          useWeeklySummary.js
        utils/
          dateTime.js
          weekUtils.js
        validation/
          taskSchema.js
    pages/
      HomePage.jsx
    styles/
      index.css
    main.jsx
  .env.example
  package.json
```

Adapt the structure to the existing repository when appropriate. Do not create empty folders or abstraction layers that are not used.

### 6.1 Component responsibilities

- `App`: application shell and top-level providers.
- `HomePage`: coordinates search state, weekly summary, expanded week, and task form visibility.
- `WeekList`: renders week summaries.
- `WeekCard`: displays one week's date range and open/completed counts; owns only its expand/collapse presentation.
- `TaskList`: renders tasks for an expanded week or search result set.
- `TaskItem`: displays a task and its available actions; does not make business rules about week counting.
- `TaskForm`: reusable create/edit form with validation.
- `SearchPanel`: collects query and displays search feedback/results, or delegates results to the shared task list.
- `ConfirmDialog`: reusable accessible delete confirmation.

Use props for component inputs and callbacks. Keep API calls out of low-level presentational components where practical.

### 6.2 Server state and cache updates

Use TanStack Query for server data:

- Query weekly summaries with the current browser timezone.
- Query a week's tasks only when that week is expanded.
- Query search results when a non-empty query is entered.
- Invalidate or update relevant queries after create, edit, status update, and delete.
- When an edit moves a task to a different week, invalidate the summary and task queries for both the old and new periods, or invalidate the relevant task query family.
- Avoid refetching every query on every keystroke; debounce search.
- Show loading and error UI explicitly. Do not leave a blank screen while requests are pending.

Use a single API client module to configure the API base URL, JSON parsing, and normalized errors. Use `AbortSignal` where supported to cancel stale search requests.

### 6.3 Form validation

Use the same validation rules in the browser and server, even if separate schemas are required because client and server are separate packages.

Client validation should provide immediate, human-readable field feedback. Server validation remains authoritative.

### 6.4 Date utility design

Create a small tested date utility module. Do not scatter date calculations across JSX components.

It should provide functions similar to:

```js
startOfWeekMonday(date, timeZone)
startOfNextWeekMonday(date, timeZone)
formatWeekRange(start, endExclusive, timeZone)
toDateTimeLocalValue(isoDate, timeZone)
fromDateTimeLocalValue(localValue, timeZone)
```

Use a well-maintained timezone/date library if needed (for example, `date-fns` with timezone support or Temporal where available through a stable polyfill). Avoid handwritten timezone conversion logic that only works in UTC or one offset. Keep the abstraction small and test its behavior around local midnight, Monday/Sunday, and daylight-saving transitions.

### 6.5 Visual quality

- Extract colors, type scale, spacing, radii, shadows, and button styles from Figma into a small set of Tailwind theme tokens or CSS variables.
- Use consistent spacing and typography instead of arbitrary one-off values.
- Prefer a clear visual hierarchy: week date range, summary numbers, task title, and task actions.
- Show priority as a small, readable label or indicator; do not rely on color alone.
- Include focus, hover, pressed, disabled, loading, expanded, and error states.
- Avoid decorative gradients, excessive cards, or visual effects that are not in the Figma design.
- Use icons from one consistent icon library if Figma requires icons. Do not use emoji as a replacement for interface icons.

---

## 7. Backend structure and implementation guidance

Suggested structure:

```text
server/
  src/
    config/
      database.js
      env.js
    modules/
      tasks/
        task.model.js
        task.validation.js
        task.service.js
        task.controller.js
        task.routes.js
    middleware/
      errorHandler.js
      notFound.js
      validateRequest.js
    utils/
      ApiError.js
      asyncHandler.js
    app.js
    server.js
  tests/
    tasks.api.test.js
  .env.example
  package.json
```

### 7.1 Layer responsibilities

Keep a small separation of responsibilities:

- **Routes:** define endpoint paths and middleware.
- **Validation:** validate params, query strings, and request bodies.
- **Controller:** read validated input, call the service, and write HTTP responses.
- **Service:** contain task behavior and database operations that represent use cases.
- **Model:** define the Mongoose schema and indexes.
- **Middleware:** handle shared concerns such as errors and unknown routes.

Do not add a repository layer unless there is a concrete reason. Do not put database queries in React components or Express route declarations.

### 7.2 Application boot

- Separate `app.js` (Express app construction) from `server.js` (environment loading, database connection, listening, graceful shutdown).
- Make the Express app importable by tests without opening a real network port.
- Validate required environment variables at startup.
- Connect to MongoDB before accepting requests.
- Handle `SIGTERM`/`SIGINT` with a clean server and database shutdown when practical.
- Do not commit `.env` files or secrets.

### 7.3 Error handling

- Use one centralized Express error handler.
- Convert known validation, not-found, and database errors into stable API error responses.
- Log unexpected server errors with enough context for debugging, but never log secrets.
- In production, do not expose stack traces to clients.
- Avoid `try/catch` duplication in every controller when a small `asyncHandler` wrapper can forward rejected promises to the central handler.

### 7.4 Backend security basics

Even for an assessment, implement sensible defaults:

- `helmet` for common HTTP security headers.
- CORS configured with an explicit frontend origin from environment variables; do not use unrestricted `*` for a credentialed app.
- JSON body size limit.
- Validate and allowlist accepted fields; do not spread arbitrary request bodies into MongoDB updates.
- Validate MongoDB ObjectId route parameters.
- Enforce maximum query lengths and pagination limits.
- Never construct MongoDB query operators from client-controlled keys.
- Rate-limit write endpoints and/or public API traffic if deployed openly.
- Keep secrets in environment variables.
- Use HTTPS for deployed frontend/API endpoints.

If authentication is added later, task ownership filtering must be enforced in the service/database query for **every** read, update, status, and delete operation. Hiding buttons in the frontend is not authorization.

---

## 8. Suggested repository layout

A single GitHub repository is easiest for review:

```text
 todo-list-app/
   client/
   server/
   .github/
     workflows/
       ci.yml                 # optional but recommended
   .gitignore
   README.md
   package.json              # optional root scripts/workspaces
```

Use clear scripts, for example:

- `client`: `dev`, `build`, `preview`, `test`, `lint`.
- `server`: `dev`, `start`, `test`, `lint`.
- Root: `dev` (runs client/server together), `test`, `lint`, `build` if using npm workspaces or a small runner.

Do not add a monorepo tool unless it provides real value for this small project.

---

## 9. Testing requirements

Tests should validate behavior, not just confirm that components render.

### 9.1 Backend/API tests

At minimum, cover:

1. Create a valid task.
2. Reject a missing/blank title.
3. Reject an invalid/missing `scheduledAt`.
4. Accept omitted description and omitted priority.
5. Reject an unsupported priority.
6. New task defaults to `IN_PROGRESS`.
7. Fetch a task by ID.
8. Return `404` for an unknown task ID and malformed IDs with a controlled client error.
9. Update only allowed fields.
10. Reject attempts to update protected/internal fields.
11. Change status from `IN_PROGRESS` to `COMPLETED` and back.
12. Delete a task and return `204`.
13. Search matches title and description.
14. Search does not accept unbounded/unsafe query input.
15. Date-range filters use `from` inclusive and `to` exclusive.
16. Weekly aggregation uses Monday as the beginning of the week and counts each status correctly.

Use an isolated test database or an in-memory MongoDB test instance. Tests must not alter development or production data.

### 9.2 Frontend tests

At minimum, cover:

1. Empty-state rendering when no task weeks are returned.
2. Weekly summary renders open and completed counts.
3. Expanding a week loads/displays that week's tasks.
4. Add form requires title and date/time.
5. Add form allows optional description and priority.
6. Successful create closes the form and refreshes the summary/list.
7. Edit form is prefilled and saves changes.
8. Status action updates the visible status and weekly count.
9. Delete action requires the expected confirmation and removes the task on success.
10. Search matches and displays result actions.
11. Search empty state and API error state are understandable.
12. The UI remains usable at a narrow mobile viewport.

### 9.3 Date and timezone tests

This feature deserves dedicated unit tests:

- Monday 00:00 belongs to the new week.
- Sunday 23:59 belongs to the week ending that Sunday.
- The next Monday is the start of the next week.
- A task just before the Monday boundary belongs to the prior week.
- Local time displays consistently after save and reload.
- Date/time values around daylight-saving changes remain valid in supported timezones.
- UTC serialization does not shift the displayed date unexpectedly.

### 9.4 Manual QA checklist

Run the following flows in a real browser, including a mobile-sized viewport:

- Create one task with title/date only.
- Create another task with description and High priority.
- Edit the title, date/time, description, and priority.
- Move a task from one week to another by editing its date/time.
- Mark a task completed; verify the open/completed counts change.
- Mark it In Progress again; verify counts change back.
- Delete a task through the swipe action on touch/mobile or its accessible equivalent on desktop.
- Search by a title word.
- Search by a description word.
- Open a search result and edit/delete it.
- Reload the page and verify tasks persist from MongoDB.
- Verify no browser console errors, failed API requests, or horizontal overflow.

---

## 10. Accessibility and usability baseline

Implement the following without building a separate accessibility framework:

- Use semantic buttons, labels, headings, lists, and form controls.
- Associate every input with a visible label or accessible name.
- Ensure dialogs manage focus, close predictably, and return focus to the invoking control.
- Keyboard users must be able to expand a week and operate task actions.
- Use visible focus styles.
- Do not encode status or priority only by color.
- Announce important asynchronous status changes where appropriate (for example, using `aria-live` for save/delete feedback).
- Ensure icon-only buttons have accessible names.
- Respect `prefers-reduced-motion`.
- Avoid swipe-only functionality.

---

## 11. Environment configuration

Provide `.env.example` files with placeholder values only.

### Server example

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/todo_list
CLIENT_ORIGIN=http://localhost:5173
```

### Client example

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Never commit real credentials, connection strings, or production environment files. The README must explain how to copy the example files and configure local MongoDB or MongoDB Atlas.

---

## 12. Deployment and security notes

Deployment is an additional assessment advantage, not a reason to complicate the app.

Recommended deployment shape:

- Frontend: Netlify or Vercel.
- Backend: a Node-compatible hosting provider such as Render or Railway.
- Database: MongoDB Atlas or another managed MongoDB service.

Deployment requirements:

1. Configure production environment variables in the hosting dashboards.
2. Set the backend CORS allowlist to the deployed frontend origin.
3. Set the frontend API base URL to the deployed API.
4. Configure SPA fallback/rewrite behavior for the frontend host if client-side routes are added.
5. Verify `/api/v1/health` after deployment.
6. Verify create, read, update, status update, delete, search, and weekly summaries against the deployed API.
7. Do not expose MongoDB credentials in the client bundle.
8. Do not use a development database for public production traffic.

**Public demo warning:** Because authentication is not specified in the assessment, the baseline may be a single-user demo. A public unauthenticated CRUD API is not suitable for private real-user data. Either keep the deployment clearly labeled as a demo and avoid storing sensitive data, or add authentication and ownership checks before treating it as a real production service.

---

## 13. README and submission requirements

The repository README should include:

- Project name and short overview.
- Feature list matching the assessment.
- Screenshots or a short GIF of the final responsive UI.
- Tech stack.
- Architecture overview (client, Express API, MongoDB).
- Local setup prerequisites.
- Installation commands.
- Environment variable setup.
- How to run frontend and backend locally.
- How to run tests and lint/build checks.
- API endpoint summary or a link to API documentation.
- Live deployed URL, if deployed.
- Known limitations, including authentication status and any Figma access limitation.

Before submission:

- Ensure the GitHub repository is accessible to the evaluator.
- Remove `.env`, build artifacts, `node_modules`, logs, and local database files from Git.
- Include `.gitignore`.
- Check that the app can be installed from a clean clone using documented commands.
- Do not claim a deployment or test result unless it has actually been verified.

---

## 14. Definition of done / acceptance criteria

The work is complete only when all applicable criteria below pass.

### Functional

- [ ] User can create a task with title and date/time.
- [ ] Description and priority are optional.
- [ ] Priority accepts only Low, Medium, High.
- [ ] User can edit all task fields.
- [ ] User can delete a task.
- [ ] User can search title and description keywords.
- [ ] Search results provide view, edit, and delete actions.
- [ ] Tasks are grouped by Monday–Sunday local weeks.
- [ ] Each week displays open and completed counts.
- [ ] Selecting a week expands it and lists its tasks.
- [ ] User can switch a task between In Progress and Completed.
- [ ] Weekly counts refresh after create, edit, move-to-another-week, status change, and delete.
- [ ] Data remains available after browser refresh because it is persisted in MongoDB.

### UI and accessibility

- [ ] UI follows the supplied Figma design as closely as practical.
- [ ] Mobile layout works without horizontal overflow.
- [ ] Tablet and desktop layouts remain usable.
- [ ] Loading, empty, validation, success, and error states are present.
- [ ] Task actions work with keyboard and touch.
- [ ] Swipe is not the only delete interaction.
- [ ] Inputs and icon-only actions have accessible labels.

### Engineering

- [ ] Frontend and backend have clear, small responsibilities.
- [ ] Request input is validated on the server.
- [ ] API errors have a consistent shape.
- [ ] No secrets are committed or exposed to the browser.
- [ ] Date/week boundary tests pass.
- [ ] API and frontend tests pass.
- [ ] Lint and production build pass.
- [ ] README contains reproducible setup and run instructions.

### Delivery

- [ ] GitHub repository is ready to share.
- [ ] Deployed frontend and API work, if deployment is attempted.
- [ ] The final handoff reports what was implemented and which commands were actually run.
- [ ] Any incomplete item or known limitation is stated honestly.

---

## 15. Instructions to the coding AI agent

Follow this sequence. Do the implementation, not just a plan or a code sample.

### Step 1 — Inspect before changing

1. Inspect the existing repository and identify its current stack, scripts, and conventions.
2. Read the Figma file and map its frames/components to the required flows.
3. Check whether a frontend, backend, or database implementation already exists. Preserve working code and avoid unnecessary rewrites.
4. Identify any mismatch between the repository and this spec. Explain only material conflicts; otherwise proceed with the existing convention.

### Step 2 — Build the smallest complete vertical slice

1. Set up the Express application and MongoDB connection.
2. Implement the task model, validation, API routes, service, and centralized error handling.
3. Verify create/read/update/status/delete with API tests or direct API calls.
4. Build the React home screen and weekly summary.
5. Add expand-week behavior and fetch tasks for the selected week.
6. Add the reusable create/edit form.
7. Add status change and deletion.
8. Add global title/description search.
9. Apply Figma styling and responsive behavior.
10. Add automated tests and documentation.

Do not stop after building the static UI. Every visible action must work against the API.

### Step 3 — Keep code quality practical

- Prefer readable JavaScript and small functions over clever abstractions.
- Use descriptive names; avoid abbreviations that make business behavior unclear.
- Keep components focused, but do not split every few lines into another component.
- Keep date/week logic in tested utilities.
- Keep API calls in a shared API module/hooks, not scattered through components.
- Validate untrusted input at the API boundary.
- Use async/await and centralized error handling.
- Do not swallow errors or log-and-continue when the user needs feedback.
- Do not hard-code API URLs, secrets, fake counts, or permanent sample data.
- Avoid `any`-style unvalidated objects and arbitrary request-body spreading.
- Do not add packages when a small native implementation is sufficient.
- Avoid premature optimization; correctness and clarity come first.

### Step 4 — Verify before reporting

Run the commands that actually exist in the repository, including as applicable:

```bash
npm install
npm run lint
npm test
npm run build
```

Run client and server commands separately if the repository has separate package files. Fix failures introduced by the implementation. If a command cannot run because a dependency/service/credential is unavailable, report the exact blocker instead of claiming success.

### Step 5 — Final handoff format

At completion, provide:

1. Summary of implemented functionality.
2. Important architecture and data/API decisions.
3. Exact local run instructions.
4. Exact test, lint, and build commands run, with pass/fail results.
5. GitHub repository URL, if created/pushed.
6. Deployment URL, if deployed and verified.
7. Known limitations or incomplete items.

Do not claim that code is production-ready merely because it builds. State what has been tested and what remains unverified.

---

## 16. Final implementation philosophy

This is a compact SDE-1 assignment. The strongest submission is not the one with the most folders, dependencies, or patterns. It is the one that:

- Implements every requested flow end to end.
- Matches the supplied design.
- Handles dates and Monday-based weeks correctly.
- Keeps weekly counts consistent after every mutation.
- Persists data through a real API and MongoDB.
- Works on mobile and desktop.
- Provides clear validation, loading, empty, and error states.
- Has focused tests and reproducible setup instructions.
- Is easy for another engineer to read and extend.

**Build the simplest complete solution that meets these standards.**
