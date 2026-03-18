# Calendar Task Manager

A calendar grid with task management, drag-and-drop, color labels, and public holidays — built without any calendar libraries.

**[Live Demo](https://your-app.vercel.app)** | **[API Swagger](https://your-api.railway.app/api/docs)**

## Implemented Requirements

- [x] Calendar grid implemented **without calendar libraries**
- [x] Create and edit tasks inside calendar cells (inline editing)
- [x] Drag & drop — reassign tasks between days
- [x] Drag & drop — reorder tasks within a day
- [x] Filter tasks by text search
- [x] Worldwide holidays from [Nager.Date API](https://date.nager.at/swagger/index.html)
- [x] Holiday names are fixed on cells (not draggable/reorderable)
- [x] Tasks stored in PostgreSQL via Node.js CRUD API

## Tech Stack

- **TypeScript** — strict mode, both frontend and backend
- **React 19** + **React Hooks** (useState, useReducer, useCallback, useMemo, useEffect, useContext, useRef)
- **styled-components** (CSS-in-JS) — theme system, responsive breakpoints, transient props
- **NestJS** — REST API with Prisma ORM, class-validator DTOs, Swagger docs
- **PostgreSQL** — Task, Label, TaskLabel (many-to-many)
- **@dnd-kit** — drag & drop (pointer, touch, keyboard)
- **Vitest + Testing Library** — 91 frontend tests (unit + UI components)
- **Jest + Supertest** — 75 backend tests (unit + E2E)

## Quick Start

```bash
# 1. Backend
cd backend
cp .env.example .env          # set DATABASE_URL
yarn install
yarn prisma:migrate
yarn start:dev                # http://localhost:3000/api

# 2. Frontend
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Or run everything with Docker:

```bash
docker-compose up --build     # http://localhost
```

## Run Tests

```bash
# Backend — 54 unit + 21 E2E tests
cd backend
yarn test                     # unit tests
yarn test:e2e                 # E2E (requires DB)

# Frontend — 91 tests (unit + UI components)
cd frontend
npm test                      # all tests
npm run test:ui               # UI component tests only
```

## API Endpoints

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| GET    | /api/tasks         | Get tasks by month/year    |
| POST   | /api/tasks         | Create a task              |
| PUT    | /api/tasks/:id     | Update a task              |
| PUT    | /api/tasks/reorder | Reorder tasks within a day |
| DELETE | /api/tasks/:id     | Delete a task              |
| GET    | /api/labels        | Get all labels             |
| POST   | /api/labels        | Create/upsert a label      |
| DELETE | /api/labels/:id    | Delete a label             |
| GET    | /api/holidays      | Get holidays by year/country |

## Project Structure

```
├── backend/            NestJS API
│   ├── src/
│   │   ├── tasks/      Task CRUD + reorder + specs
│   │   ├── labels/     Color labels + specs
│   │   ├── holidays/   Nager.Date proxy + cache + specs
│   │   └── common/     Global exception filter + spec
│   └── test/           E2E tests (supertest)
├── frontend/           React SPA
│   ├── src/
│   │   ├── components/ Calendar, Task, Search, Holiday + tests
│   │   ├── context/    TaskContext, Navigation, Search, Holiday + tests
│   │   ├── hooks/      useCalendar, useDragDrop, useTaskLoader
│   │   ├── api/        Axios client + tests
│   │   └── utils/      Date helpers + tests
└── docker-compose.yml
```
