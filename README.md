# Test Management Tool

A test management platform built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL (Neon).

## Features

- User authentication (foundation with User model)
- Organisation and project management
- Test case management (with steps)
- Test execution tracking
- Defect tracking
- Test planning and suites
- API routes for data access

## Prerequisites

- Node.js (v22.12.0 or later)
- npm
- Neon PostgreSQL account (or any PostgreSQL database)

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy the `.env.example` file to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   You will need to provide:
   - `DATABASE_URL_UNPOOLED`: Your Neon PostgreSQL connection string (unpooled)
   - Other optional environment variables for integrations (GitHub, Jira, etc.)

4. Push the Prisma schema to the database:

   ```bash
   npx prisma db push
   ```

   Note: We are using the ORM contract approach, but the traditional Prisma CLI can also be used for migrations.

5. Start the development server:

   ```bash
   npm run dev
   ```

   The app will be available at http://localhost:3001

## Database Schema

The database schema includes the following models:

- User
- Organisation
- OrganisationMember
- Project
- ProjectMember
- TestCase
- TestStep
- TestExecution
- TestStepResult
- Defect
- TestPlan
- TestSuite
- TestPlanCase

## API Routes

- `GET /api/test` - Test database connection (returns user count)

## Extending the Tool

- Add authentication using NextAuth.js or a custom solution.
- Implement API routes for all models (e.g., `/api/users`, `/api/projects`, etc.).
- Create frontend pages using Next.js and Tailwind CSS.
- Add AI features using the Neon AI Gateway (when available) or other AI services.

## License

MIT
