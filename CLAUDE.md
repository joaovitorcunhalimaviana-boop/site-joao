# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medical scheduling and electronic health record (EHR) system for Dr. João Vitor Viana, a colorectal surgeon. Built with Next.js 15, TypeScript, Prisma (SQLite), and shadcn/ui components.

## Common Development Commands

### Development & Build
```bash
npm run dev                    # Start development server
npm run build                  # Production build (skips lint/type checks)
npm start                      # Start production server (PORT defaults to 3000)
```

### Database
```bash
npm run db:generate            # Generate Prisma client
npm run db:push                # Push schema changes to database
npm run db:migrate             # Create and apply migration
npm run db:migrate:deploy      # Deploy migrations in production
npm run db:seed                # Seed database with initial data
npm run db:studio              # Open Prisma Studio
npm run db:reset               # Reset database (WARNING: destructive)
```

### Testing
```bash
npm test                       # Run tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
npm run test:ci                # Run tests in CI mode
```

### Backup System
```bash
npm run backup:init            # Initialize backup system (first time setup)
npm run backup:start           # Start backup scheduler
npm run backup:manual          # Create manual backup
npm run backup:cleanup         # Clean old backups (>30 days)
npm run backup:status          # Check backup system status
```

### Code Quality
```bash
npm run lint                   # Run ESLint
npm run lint:fix               # Auto-fix linting issues
npm run format                 # Format code with Prettier
npm run format:check           # Check code formatting
```

## Architecture Overview

### Two-Layer Patient System

The system uses a **dual-layer architecture** for patient data management:

1. **CommunicationContact** (`lib/unified-patient-system.ts`):
   - Broader contact database for newsletters, reviews, public appointments
   - No CPF required
   - Stores communication preferences (email, WhatsApp)
   - Tracks registration sources (newsletter, public_appointment, review, etc.)

2. **MedicalPatient** (linked to CommunicationContact):
   - Medical records layer - requires CPF
   - Full medical history, insurance, allergies, medications
   - Generated sequential medical record number
   - LGPD consent tracking
   - References a CommunicationContact via `communicationContactId`

**Key principle**: Public forms create CommunicationContacts. When a medical appointment is formalized, a MedicalPatient is created and linked.

### Authentication & Security

- **Middleware**: `middleware.ts` - Currently simplified (no complex auth enforcement)
- **Auth system**: JWT-based authentication in `lib/auth.ts` and `lib/auth-middleware.ts`
- **Two-factor auth**: Available via `lib/two-factor-auth.ts`
- **Security headers**: Configured in `next.config.js` (HSTS, CSP, X-Frame-Options, etc.)
- **Rate limiting**: Applied to API routes via `lib/rate-limiter.ts`
- **Audit logging**: All critical operations logged to `AuditLog` model

### Database Schema (Prisma)

Key models:
- **User**: Doctors, secretaries, admins (roles: DOCTOR, SECRETARY, ADMIN)
- **CommunicationContact**: Communication layer (emails, WhatsApp, reviews)
- **MedicalPatient**: Medical records layer (CPF, insurance, medical history)
- **Appointment**: Links to both CommunicationContact and optionally MedicalPatient
- **Consultation**: Medical consultations with SOAP notes
- **MedicalRecord**: Digital medical records with signatures
- **ScheduleBlock**: Doctor availability blocking (vacation, conferences, etc.)
- **BackupLog**: Automated backup tracking

Database file: `prisma/database.db` (SQLite)

### API Structure

Routes are organized in `app/api/`:
- **Authentication**: `/api/auth/*` (login, logout, refresh tokens)
- **Appointments**: `/api/appointments/*`, `/api/public-appointment`
- **Patients**: `/api/patients/*`, `/api/unified-system/*`
- **Medical records**: `/api/medical-records/*`, `/api/consultations/*`
- **Backup**: `/api/backup/*`, `/api/backup/restore`
- **Telegram**: `/api/telegram-bot` (webhook for notifications)
- **Schedule**: `/api/schedule/*`, `/api/schedule-slots/*`

### Notification Systems

1. **Telegram** (`lib/telegram-notifications.ts`):
   - Sends appointment notifications to doctors
   - Sends daily agenda summaries
   - Requires `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`

2. **WhatsApp** (via WhatsApp Business API):
   - Confirmation links in appointments
   - Reminder system (`lib/reminder-scheduler.ts`)
   - 24-hour pre-appointment reminders

3. **Email** (Newsletter system):
   - Newsletter subscriptions via `CommunicationContact.emailPreferences`
   - Health tips and appointment reminders

### Scheduled Tasks

- **Backup scheduler** (`scripts/backup-scheduler.js`):
  - Daily backups at 2:00 AM
  - Weekly cleanup (Sundays 3:00 AM)
  - 30-day retention policy

- **Daily agenda scheduler** (`lib/daily-agenda-scheduler.ts`):
  - Sends daily agenda to doctor via Telegram

- **Reminder scheduler** (`lib/reminder-scheduler.ts`):
  - 24-hour appointment reminders

### TypeScript Configuration

- **Strict mode**: Partially enabled (`tsconfig.json`)
- `noImplicitAny`: false (legacy codebase)
- Path aliases: `@/*` maps to project root
- Build ignores type errors: `next.config.js` has `ignoreBuildErrors: true`

### Performance & Optimization

- **Bundle splitting**: Configured in `next.config.js` webpack settings
- **Image optimization**: WebP/AVIF formats, unoptimized mode enabled
- **Code splitting**: Analytics and performance components split into async chunks
- **Security headers**: Comprehensive CSP, HSTS, X-Frame-Options
- **Compression**: Enabled via `compress: true` in Next.js config

### Testing

- **Framework**: Jest with React Testing Library
- **Coverage targets**: 70% across branches, functions, lines, statements
- **Test location**: `__tests__/` directory
- **Watch plugins**: Filename and testname typeahead enabled
- **Timeout**: 10 seconds for complex medical calculator tests

## Key Files to Know

- `lib/unified-patient-system.ts`: Core patient data management logic
- `lib/auth.ts`: Authentication and JWT handling
- `prisma/schema.prisma`: Database schema definition
- `next.config.js`: Next.js configuration with security headers
- `middleware.ts`: Request routing and (currently minimal) auth
- `lib/backup-service.ts`: Automated backup system
- `lib/telegram-notifications.ts`: Telegram integration for doctor notifications

## Deployment

- **Target platforms**: Vercel (recommended), Railway, Netlify
- **Environment variables**: See `RAILWAY_ENV_VARS.md` and `.env` requirements
- **Database**: SQLite in development, consider PostgreSQL for production
- **Build command**: `npm run build` (ignores lint/type errors by design)
- **Start command**: `npm start` (uses PORT env var or 3000)
- **Docker**: Dockerfile available for containerized deployment

## Important Notes

- Build process intentionally skips TypeScript and ESLint errors (`next.config.js`)
- SQLite database is used; migrations are in `prisma/migrations/`
- Backup system creates emergency backups in `backups/emergency/`
- Medical data requires LGPD compliance tracking (consents in schema)
- All authenticated routes should use JWT validation via auth middleware
- Telegram bot requires webhook setup for production (see `TELEGRAM_WEBHOOK.md`)
