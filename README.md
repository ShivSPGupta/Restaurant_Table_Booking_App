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
CORS_ORIGIN=http://localhost:3000
DATA_DIR=./data
JWT_SECRET=change-this-to-a-long-random-secret
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
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

## Supabase Setup

Create one Supabase project and use its PostgreSQL database for this app:

```text
Supabase Dashboard -> Project Settings -> Database -> Connection string
```

Use the transaction pooler connection as `DATABASE_URL`. This is best for Vercel/serverless runtime.

Keep the direct connection as `DIRECT_URL` for reference. If Prisma schema sync fails with the pooler URL, temporarily copy the `DIRECT_URL` value into `DATABASE_URL` locally, run the schema command, then switch `DATABASE_URL` back to the pooler URL for runtime/deployment.

After updating `backend/.env`, sync the Prisma schema to Supabase:

```bash
cd backend
npm run db:generate
npm run db:push
```

For Vercel backend deployment, add these environment variables:

```text
NODE_ENV=production
CORS_ORIGIN=https://restaurant-table-booking-front.vercel.app
JWT_SECRET=your-secure-production-secret
DATABASE_URL=your-supabase-transaction-pooler-url
DIRECT_URL=your-supabase-direct-url
```

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
npm run db:push     # Push Prisma schema to Supabase/PostgreSQL
npm run db:deploy   # Apply committed Prisma migrations in production
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
GET  /api/docs
GET  /api/docs/openapi.json
POST /api/auth/register
POST /api/auth/login
POST /api/check-availability
POST /api/book-table
```

Interactive Swagger API documentation is available at:

```text
http://localhost:3001/api/docs
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

Restaurant register request:

```json
{
  "name": "The Green Fork",
  "email": "owner@greenfork.com",
  "password": "securepass123",
  "phone": "+91 98765 43210",
  "address": "12 Market Street"
}
```

Restaurant login request:

```json
{
  "email": "owner@greenfork.com",
  "password": "securepass123"
}
```

## Production Notes

The backend uses PostgreSQL through Prisma when `DATABASE_URL` is configured. The Prisma schema enforces unique reservations by `date` and `time`, which helps prevent duplicate bookings at the database level.

Do not commit real `.env` files. Commit only `.env.example` files.
