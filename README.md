# Restaurant Table Booking

A full-stack restaurant reservation app built with Next.js, React, Express, and TypeScript. Guests can check table availability and create reservations through a polished booking UI, while the backend keeps reservation logic separated into controllers, services, repositories, routes, and config.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Axios
- Backend: Node.js, Express, TypeScript
- Storage: PostgreSQL with Prisma, with JSON file fallback for local tests
- Tooling: ESLint, TypeScript compiler, Node test runner

## Project Structure

```text
restaurant_table_booking/
  backend/
    api/                 Vercel API entry
    data/                Local reservation storage
    prisma/              Prisma schema and migrations
    src/
      config/            Environment config
      controllers/       Request handlers
      errors/            App error types
      middleware/        Express middleware
      repositories/      Data access layer
      routes/            API routes
      services/          Business logic
      types/             Shared backend types
  frontend/
    src/
      app/               Next App Router pages and route handlers
      components/        UI components
      lib/               API client helpers
      types/             Frontend declarations
```

## Environment Setup

Create local env files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend defaults:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:3010
DATA_DIR=./data
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
```

Frontend defaults:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Install Dependencies

Install dependencies separately for each app:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run Locally

If you have a PostgreSQL database URL, generate Prisma client and run migrations:

```bash
cd backend
npm run db:generate
npm run db:migrate
```

If `DATABASE_URL` is not set, the backend falls back to local JSON file storage.

Start the backend:

```bash
cd backend
npm run build
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the frontend URL shown by Next.js, usually:

```text
http://localhost:3000
```

If port `3000` is busy, Next.js may choose another port. Make sure that port is included in `backend/.env` under `CORS_ORIGIN`.

## Available Scripts

Backend:

```bash
npm run build   # Compile TypeScript to dist/
npm run dev     # Start TypeScript backend with auto-restart
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run Prisma migrations against PostgreSQL
npm run db:studio   # Open Prisma Studio
npm test        # Build and run API tests
npm start       # Start compiled backend
```

Frontend:

```bash
npm run dev     # Start Next.js dev server
npm run build   # Create production build
npm run start   # Start production frontend
npm run lint    # Run ESLint
```

## API Endpoints

```text
GET  /api/health
POST /api/check-availability
POST /api/book-table
```

Availability request:

```json
{
  "date": "2026-07-15",
  "time": "19:00"
}
```

Booking request:

```json
{
  "date": "2026-07-15",
  "time": "19:00",
  "guests": 4,
  "name": "Asha",
  "contact": "9999999999"
}
```

## Production Notes

The backend uses PostgreSQL through Prisma when `DATABASE_URL` is configured. The Prisma schema enforces unique reservations by `date` and `time`, which helps prevent duplicate bookings at the database level.

Do not commit real `.env` files. Commit only `.env.example` files.
