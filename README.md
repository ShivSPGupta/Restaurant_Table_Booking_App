# Restaurant Table Booking

A production-style full-stack restaurant reservation platform built with Next.js, Express, TypeScript, Prisma, and Supabase PostgreSQL. Users can discover restaurants by Indian city, check availability, and create bookings. Restaurants can register, manage tables, configure opening hours, add event or celebration spaces, and view their own reservations.

## Features

- Role-based authentication for `user` and `restaurant` accounts.
- City-based restaurant discovery before booking.
- Availability checks scoped to the selected restaurant.
- User and restaurant booking flow.
- Restaurant dashboard for reservations, tables, event spaces, and business hours.
- Supabase PostgreSQL integration through Prisma.
- Dedicated PostgreSQL schema and prefixed tables to safely share one Supabase project with other apps.
- Swagger/OpenAPI documentation for backend APIs.
- Clean backend architecture with controllers, services, repositories, routes, middleware, config, and typed models.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS, Axios
- Backend: Node.js, Express, TypeScript
- Database: Supabase PostgreSQL, Prisma ORM
- Auth: Custom JWT-style signed tokens with role-based middleware
- Tooling: ESLint, TypeScript compiler, Node test runner, Vercel deployment

## Project Structure

```text
restaurant_table_booking/
  backend/
    api/                 Vercel serverless entry
    prisma/              Prisma schema
    src/
      config/            Environment config
      controllers/       HTTP request handlers
      errors/            App error classes
      lib/               Prisma and shared infrastructure
      middleware/        Error, auth, and request middleware
      repositories/      Database access layer
      routes/            API route modules
      services/          Business logic
      types/             Backend TypeScript types
  frontend/
    src/
      app/               Next.js App Router pages
      components/        UI components
      lib/               API client and app constants
      types/             Frontend declarations
```

## Environment Setup

Create local environment files from the examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend `.env`:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=change-this-to-a-long-random-secret
POSTGRES_PRISMA_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
SUPABASE_CA_CERT=
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Supabase And Prisma

Use one Supabase project and keep this app isolated with the dedicated `restaurant_booking` schema. This avoids table conflicts when the same Supabase project is shared with other portfolio projects.

Current app tables:

```text
restaurant_booking.restaurant_booking_restaurants
restaurant_booking.restaurant_booking_users
restaurant_booking.restaurant_booking_reservations
restaurant_booking.restaurant_booking_tables
restaurant_booking.restaurant_booking_event_spaces
```

Use two database URLs:

```text
POSTGRES_PRISMA_URL      -> Supabase pooler URL for app runtime and Vercel
POSTGRES_URL_NON_POOLING -> Supabase direct URL for Prisma schema commands
```

After schema changes, run:

```bash
cd backend
npm run db:generate
npm run db:push
```

If Prisma cannot add a new required column because existing rows already exist, do not use `--force-reset` on a real database. Add a safe default with SQL first, then run `npm run db:push` again.

## Install And Run

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3001
Docs:     http://localhost:3001/api/docs
```

## Available Scripts

Backend:

```bash
npm run dev         # Start backend with auto-restart
npm run build       # Compile TypeScript
npm start           # Start compiled backend
npm run db:generate # Generate Prisma client
npm run db:push     # Push Prisma schema to Supabase/PostgreSQL
npm run db:migrate  # Create and run Prisma migrations
npm run db:deploy   # Apply migrations in production
npm run db:studio   # Open Prisma Studio
npm test            # Build and run backend tests
```

Frontend:

```bash
npm run dev     # Start Next.js dev server
npm run build   # Create production build
npm run start   # Start production frontend
npm run lint    # Run ESLint
```

## API Overview

Health and docs:

```text
GET  /api/health
GET  /api/health/db
GET  /api/docs
GET  /api/docs/openapi.json
```

Authentication:

```text
POST /api/auth/user/register
POST /api/auth/user/login
POST /api/auth/restaurant/register
POST /api/auth/restaurant/login
```

Public booking flow:

```text
GET  /api/restaurants?city=Mumbai
POST /api/check-availability
POST /api/book-table
GET  /api/reservations
```

Restaurant management:

```text
GET   /api/restaurant/reservations
GET   /api/restaurant/tables
POST  /api/restaurant/tables
PATCH /api/restaurant/tables/:tableId
GET   /api/restaurant/event-spaces
POST  /api/restaurant/event-spaces
PATCH /api/restaurant/availability
```

Protected routes require a bearer token:

```text
Authorization: Bearer <token>
```

Restaurants can only access their own reservations, tables, event spaces, and availability settings. Users can create bookings for selected restaurants and view bookings linked to their own account.

## Deployment

Backend production variables for Vercel:

```env
NODE_ENV=production
CORS_ORIGIN=https://restaurant-table-booking-front.vercel.app
JWT_SECRET=your-secure-production-secret
POSTGRES_PRISMA_URL=your-supabase-pooler-url
POSTGRES_URL_NON_POOLING=your-supabase-direct-url
SUPABASE_CA_CERT=your-supabase-ca-certificate
```

Frontend production variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://restaurant-table-booking-app-back.vercel.app
```

Before deploying backend schema changes:

```bash
cd backend
npm run db:generate
npm run db:push
```

## Production Notes

- Keep real `.env` files out of Git and commit only `.env.example` files.
- Use a long random `JWT_SECRET` in production.
- Keep `POSTGRES_PRISMA_URL` pointed at the Supabase pooler for serverless runtime.
- Keep `POSTGRES_URL_NON_POOLING` pointed at the direct Supabase host for Prisma schema commands.
- Add `SUPABASE_CA_CERT` when you want strict database certificate verification in production.
