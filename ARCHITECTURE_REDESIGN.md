# Patient/Contact Data Architecture Redesign

## Executive Summary

This document presents a comprehensive redesign of the patient/contact data architecture to cleanly separate:
1. **CommunicationContact** (people without CPF - newsletter, leads, reviews)
2. **MedicalPatient** (people with CPF - full medical records)

## Current State Analysis

### Problems Identified

1. **Data Duplication**: The current system uses both Prisma models AND JSON file storage (`lib/unified-patient-system.ts`), leading to inconsistency
2. **Mixed Responsibilities**: `CommunicationContact` model has both communication AND review data mixed together
3. **Redundant Fields**: `Appointment` model duplicates patient data instead of just referencing
4. **Unnecessary Model**: `NewsletterSubscriber` model is redundant with `CommunicationContact`
5. **Inconsistent Flow**: Newsletter signup, public appointments, and reviews all create different data structures

### Current Models (Prisma Schema)

```prisma
// CURRENT SCHEMA - PROBLEMS HIGHLIGHTED

model CommunicationContact {
  id                    String   @id @default(cuid())
  name                  String
  email                 String?
  whatsapp              String?
  birthDate             String?

  // TOO MANY FIELDS - SHOULD BE SIMPLIFIED
  registrationSources   String?  // Should be separate RegistrationSource model

  // EMAIL PREFERENCES - OK
  emailSubscribed       Boolean  @default(true)
  emailNewsletter       Boolean  @default(true)
  emailHealthTips       Boolean  @default(true)
  emailAppointments     Boolean  @default(true)
  emailPromotions       Boolean  @default(false)
  emailSubscribedAt     DateTime?
  emailUnsubscribedAt   DateTime?

  // WHATSAPP PREFERENCES - OK
  whatsappSubscribed    Boolean  @default(true)
  whatsappAppointments  Boolean  @default(true)
  whatsappReminders     Boolean  @default(true)
  whatsappPromotions    Boolean  @default(false)
  whatsappSubscribedAt  DateTime?

  // REVIEW DATA - SHOULD BE SEPARATE MODEL
  reviewRating          Int?
  reviewComment         String?
  reviewDate            DateTime?
  reviewVerified        Boolean  @default(false)
  reviewApproved        Boolean  @default(false)

  // Relations
  medicalPatients       MedicalPatient[]
  appointments          Appointment[]
}

model MedicalPatient {
  id                        String   @id @default(cuid())
  communicationContactId    String   // GOOD - Links to CommunicationContact
  cpf                       String   @unique
  medicalRecordNumber       Int      @unique
  fullName                  String
  // ... rest of medical data

  communicationContact      CommunicationContact @relation(...)
}

model Appointment {
  id                           String   @id @default(cuid())
  communicationContactId       String?
  medicalPatientId             String?

  // REDUNDANT - Data duplicated from patient records
  patientName                  String
  patientCpf                   String?
  patientMedicalRecordNumber   Int?
  patientPhone                 String
  patientWhatsapp              String
  patientEmail                 String?
  patientBirthDate             String?
  // ...
}

// REDUNDANT MODEL - Should be removed
model NewsletterSubscriber {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String
  subscribed     Boolean  @default(true)
  // ... duplicates CommunicationContact
}
```

## Proposed Architecture

### 1. Data Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMUNICATION LAYER                          │
│  (Anyone who interacts with the practice - NO CPF required)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ has
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                      CommunicationContact                         │
│  ─────────────────────────────────────────────────────────────   │
│  • id                                                             │
│  • name                                                           │
│  • email (optional)                                               │
│  • whatsapp (optional)                                            │
│  • birthDate (optional)                                           │
│                                                                   │
│  Email Preferences:                                               │
│  • emailSubscribed, emailNewsletter, emailHealthTips, etc.        │
│                                                                   │
│  WhatsApp Preferences:                                            │
│  • whatsappSubscribed, whatsappAppointments, whatsappReminders    │
│                                                                   │
│  Timestamps: createdAt, updatedAt, lastContactAt                  │
└───────────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
        ┌─────────────────────┐  ┌──────────────────────┐
        │ RegistrationSource  │  │      Review          │
        │─────────────────────│  │──────────────────────│
        │ • id                │  │ • id                 │
        │ • contactId         │  │ • contactId          │
        │ • source (enum)     │  │ • rating (1-5)       │
        │ • createdAt         │  │ • comment            │
        └─────────────────────┘  │ • verified           │
                                 │ • approved           │
                                 │ • createdAt          │
                                 └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       MEDICAL LAYER                              │
│     (Patients with CPF - Full medical records & history)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ upgrades to
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                        MedicalPatient                             │
│  ─────────────────────────────────────────────────────────────   │
│  • id                                                             │
│  • communicationContactId (REQUIRED - links to contact)           │
│  • cpf (REQUIRED - unique)                                        │
│  • medicalRecordNumber (auto-generated, sequential)               │
│  • fullName                                                       │
│  • rg, address, city, state, zipCode                              │
│  • insurance data                                                 │
│  • medical info (allergies, medications, conditions, etc.)        │
│  • consents (LGPD)                                                │
│  • isActive                                                       │
└───────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────────────┐
                    │                            │
                    ▼                            ▼
        ┌─────────────────────┐      ┌────────────────────────┐
        │   Appointment       │      │   Consultation         │
        │─────────────────────│      │────────────────────────│
        │ • id                │      │ • id                   │
        │ • contactId         │      │ • appointmentId        │
        │ • medicalPatientId  │      │ • medicalPatientId     │
        │   (optional)        │      │ • doctorId             │
        │ • date, time        │      │ • anamnese, diagnosis  │
        │ • type, status      │      │ • prescriptions        │
        │ • source            │      │ • medical records      │
        └─────────────────────┘      └────────────────────────┘
```

### 2. Data Flow Patterns

#### Pattern 1: Newsletter Signup (No CPF)
```
User fills newsletter form
       ▼
Create/Update CommunicationContact
  - name, email, whatsapp (optional)
  - emailNewsletter = true
  - emailSubscribed = true
       ▼
Create RegistrationSource record
  - source = NEWSLETTER
       ▼
Send Telegram notification
```

#### Pattern 2: Public Appointment (With CPF)
```
User fills public appointment form
  - fullName, CPF, email, phone, etc.
       ▼
Validate CPF
       ▼
Check if MedicalPatient exists with CPF
       │
       ├─ YES: Use existing MedicalPatient
       │        ▼
       │   Create Appointment
       │     - link to existing MedicalPatient
       │     - link to existing CommunicationContact
       │
       └─ NO: Create new records
              ▼
         1. Create/Update CommunicationContact
              - name, email, whatsapp
              - source = PUBLIC_APPOINTMENT
              ▼
         2. Create MedicalPatient
              - link to CommunicationContact
              - CPF, fullName, insurance
              - auto-generate medicalRecordNumber
              ▼
         3. Create Appointment
              - link to MedicalPatient
              - link to CommunicationContact
              ▼
         4. Send Telegram notification
```

#### Pattern 3: Review Submission (No CPF)
```
User submits review
  - name, email, rating, comment
       ▼
Create/Update CommunicationContact
  - name, email
  - source = REVIEW
       ▼
Create Review record
  - link to CommunicationContact
  - rating, comment, approved
       ▼
Send Telegram notification
```

#### Pattern 4: Medical Area Registration (Full CPF + Medical Data)
```
Doctor/Secretary creates patient
  - Full medical data + CPF
       ▼
1. Create/Update CommunicationContact
     - communication preferences
     - source = MEDICAL_AREA
       ▼
2. Create MedicalPatient
     - Full medical data
     - CPF validation
     - LGPD consents
     - Link to CommunicationContact
```

## Schema Changes Required

### 1. Remove Redundant Model
```prisma
// DELETE THIS MODEL - It's redundant with CommunicationContact
model NewsletterSubscriber {
  // ... REMOVE COMPLETELY
}
```

### 2. Clean Up CommunicationContact
```prisma
model CommunicationContact {
  id                    String                @id @default(cuid())
  name                  String
  email                 String?
  whatsapp              String?
  birthDate             String?

  // Email Preferences (KEEP AS IS - GOOD)
  emailSubscribed       Boolean               @default(true)
  emailNewsletter       Boolean               @default(true)
  emailHealthTips       Boolean               @default(true)
  emailAppointments     Boolean               @default(true)
  emailPromotions       Boolean               @default(false)
  emailSubscribedAt     DateTime?
  emailUnsubscribedAt   DateTime?

  // WhatsApp Preferences (KEEP AS IS - GOOD)
  whatsappSubscribed    Boolean               @default(true)
  whatsappAppointments  Boolean               @default(true)
  whatsappReminders     Boolean               @default(true)
  whatsappPromotions    Boolean               @default(false)
  whatsappSubscribedAt  DateTime?

  // REMOVE REVIEW FIELDS - Move to separate Review model
  // reviewRating          Int?
  // reviewComment         String?
  // reviewDate            DateTime?
  // reviewVerified        Boolean?
  // reviewApproved        Boolean?

  // REMOVE registrationSources string - Use RegistrationSource model instead
  // registrationSources   String?

  createdAt             DateTime              @default(now())
  updatedAt             DateTime              @updatedAt
  lastContactAt         DateTime?

  // Relations (UPDATED)
  medicalPatients       MedicalPatient[]
  appointments          Appointment[]
  registrationSources   RegistrationSource[]  // NEW
  reviews               Review[]              // NEW

  @@index([email])
  @@index([whatsapp])
  @@index([emailSubscribed])
  @@index([whatsappSubscribed])
  @@map("communication_contacts")
}
```

### 3. Add New Models

```prisma
// NEW MODEL - Track registration sources separately
model RegistrationSource {
  id                String                @id @default(cuid())
  contactId         String
  source            RegistrationSourceType
  metadata          String?               // JSON for additional source-specific data
  createdAt         DateTime              @default(now())

  contact           CommunicationContact  @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([contactId])
  @@index([source])
  @@index([createdAt])
  @@map("registration_sources")
}

enum RegistrationSourceType {
  NEWSLETTER
  PUBLIC_APPOINTMENT
  DOCTOR_AREA
  SECRETARY_AREA
  REVIEW
  MEDICAL_AREA
  PUBLIC_SCHEDULING
  WHATSAPP
  PHONE
  REFERRAL
}

// NEW MODEL - Separate review data from CommunicationContact
model Review {
  id            String               @id @default(cuid())
  contactId     String
  rating        Int                  // 1-5
  comment       String
  category      String?              // Optional category of review
  verified      Boolean              @default(false)
  approved      Boolean              @default(false)
  publishedAt   DateTime?
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  contact       CommunicationContact @relation(fields: [contactId], references: [id], onDelete: Cascade)

  @@index([contactId])
  @@index([rating])
  @@index([approved])
  @@index([verified])
  @@index([createdAt])
  @@map("reviews")
}
```

### 4. Clean Up Appointment Model
```prisma
model Appointment {
  id                           String                @id @default(cuid())
  communicationContactId       String
  medicalPatientId             String?

  // REMOVE ALL DUPLICATE FIELDS - Just reference the contact/patient
  // patientName                  String
  // patientCpf                   String?
  // patientMedicalRecordNumber   Int?
  // patientPhone                 String
  // patientWhatsapp              String
  // patientEmail                 String?
  // patientBirthDate             String?

  date                         DateTime
  time                         String
  duration                     Int                   @default(30)
  type                         AppointmentType       @default(CONSULTATION)
  status                       AppointmentStatus     @default(SCHEDULED)
  notes                        String?
  reminderSent                 Boolean               @default(false)
  source                       AppointmentSource     @default(MANUAL)
  insuranceType                InsuranceType         @default(PARTICULAR)
  insurancePlan                String?
  createdAt                    DateTime              @default(now())
  updatedAt                    DateTime              @updatedAt
  createdBy                    String?

  communicationContact         CommunicationContact  @relation(fields: [communicationContactId], references: [id])
  medicalPatient               MedicalPatient?       @relation(fields: [medicalPatientId], references: [id])
  creator                      User?                 @relation("AppointmentCreator", fields: [createdBy], references: [id])
  consultation                 Consultation?

  @@index([date])
  @@index([status])
  @@index([communicationContactId])
  @@index([medicalPatientId])
  @@index([source])
  @@index([type])
  @@map("appointments")
}
```

### 5. Keep MedicalPatient As Is (Already Good)
```prisma
model MedicalPatient {
  // CURRENT MODEL IS GOOD - NO CHANGES NEEDED
  // Already properly linked to CommunicationContact
  // Has CPF validation
  // Auto-generates medicalRecordNumber
  // LGPD consents tracked
}
```

## Migration Plan

### Phase 1: Preparation (No Downtime)
1. Create new models (`RegistrationSource`, `Review`) alongside existing schema
2. Add migration script to populate new tables from existing data
3. Test migration on development database

### Phase 2: Data Migration
```sql
-- Step 1: Migrate registration sources from CommunicationContact.registrationSources
INSERT INTO registration_sources (id, contactId, source, createdAt)
SELECT
  gen_random_uuid(),
  cc.id,
  UNNEST(string_to_array(cc.registrationSources, ',')),
  cc.createdAt
FROM communication_contacts cc
WHERE cc.registrationSources IS NOT NULL;

-- Step 2: Migrate review data from CommunicationContact to Review table
INSERT INTO reviews (id, contactId, rating, comment, verified, approved, createdAt)
SELECT
  gen_random_uuid(),
  cc.id,
  cc.reviewRating,
  cc.reviewComment,
  cc.reviewVerified,
  cc.reviewApproved,
  COALESCE(cc.reviewDate, cc.createdAt)
FROM communication_contacts cc
WHERE cc.reviewRating IS NOT NULL;

-- Step 3: Migrate NewsletterSubscriber to CommunicationContact
INSERT INTO communication_contacts (
  id, name, email, whatsapp, birthDate,
  emailSubscribed, emailNewsletter, emailHealthTips, emailAppointments, emailPromotions,
  emailSubscribedAt, emailUnsubscribedAt,
  whatsappSubscribed, whatsappAppointments, whatsappReminders, whatsappPromotions,
  createdAt, updatedAt
)
SELECT
  ns.id,
  ns.name,
  ns.email,
  NULL,  -- whatsapp not in NewsletterSubscriber
  NULL,  -- birthDate not in NewsletterSubscriber
  ns.subscribed,
  ns.healthTips,
  ns.healthTips,
  ns.appointments,
  ns.promotions,
  ns.subscribedAt,
  ns.unsubscribedAt,
  true,  -- default whatsapp prefs
  true,
  true,
  false,
  COALESCE(ns.subscribedAt, ns.createdAt),
  ns.updatedAt
FROM newsletter_subscribers ns
WHERE NOT EXISTS (
  SELECT 1 FROM communication_contacts cc
  WHERE cc.email = ns.email
);

-- Step 4: Add registration source for migrated newsletter subscribers
INSERT INTO registration_sources (id, contactId, source, createdAt)
SELECT
  gen_random_uuid(),
  cc.id,
  'NEWSLETTER',
  cc.createdAt
FROM communication_contacts cc
WHERE cc.email IN (SELECT email FROM newsletter_subscribers);
```

### Phase 3: Schema Cleanup
1. Remove deprecated fields from `CommunicationContact`:
   - `registrationSources` (string)
   - `reviewRating`, `reviewComment`, `reviewDate`, `reviewVerified`, `reviewApproved`

2. Drop redundant table:
   - `NewsletterSubscriber`

3. Remove duplicate fields from `Appointment`:
   - All `patient*` fields except IDs

### Phase 4: Code Updates (see below)

## Query Patterns for Newsletter/WhatsApp Areas

### Newsletter Management Queries

```typescript
// 1. Get all newsletter subscribers (email)
const newsletterSubscribers = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
  },
  select: {
    id: true,
    name: true,
    email: true,
    birthDate: true,
    emailHealthTips: true,
    emailPromotions: true,
    emailSubscribedAt: true,
  },
  orderBy: {
    emailSubscribedAt: 'desc',
  },
});

// 2. Get newsletter subscribers by source
const newsletterFromPublicAppointments = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
    registrationSources: {
      some: {
        source: 'PUBLIC_APPOINTMENT',
      },
    },
  },
});

// 3. Get subscribers with upcoming birthdays (for birthday emails)
const birthdaySubscribers = await prisma.communicationContact.findMany({
  where: {
    emailSubscribed: true,
    emailHealthTips: true,
    birthDate: {
      not: null,
    },
  },
  // Filter by month/day in application code
});
```

### WhatsApp Communication Queries

```typescript
// 1. Get all WhatsApp contacts for appointment reminders
const whatsappContacts = await prisma.communicationContact.findMany({
  where: {
    whatsappSubscribed: true,
    whatsappReminders: true,
    whatsapp: {
      not: null,
    },
  },
  select: {
    id: true,
    name: true,
    whatsapp: true,
  },
});

// 2. Get contacts for appointment confirmations
const appointmentConfirmations = await prisma.appointment.findMany({
  where: {
    date: targetDate,
    status: 'SCHEDULED',
    communicationContact: {
      whatsappSubscribed: true,
      whatsappAppointments: true,
    },
  },
  include: {
    communicationContact: {
      select: {
        name: true,
        whatsapp: true,
      },
    },
    medicalPatient: {
      select: {
        medicalRecordNumber: true,
      },
    },
  },
});

// 3. Get promotional WhatsApp list
const promotionalWhatsApp = await prisma.communicationContact.findMany({
  where: {
    whatsappSubscribed: true,
    whatsappPromotions: true,
    whatsapp: {
      not: null,
    },
  },
});
```

### Reviews Queries

```typescript
// 1. Get approved reviews for public display
const publicReviews = await prisma.review.findMany({
  where: {
    approved: true,
  },
  include: {
    contact: {
      select: {
        name: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
});

// 2. Get pending reviews for moderation
const pendingReviews = await prisma.review.findMany({
  where: {
    approved: false,
  },
  include: {
    contact: {
      select: {
        name: true,
        email: true,
      },
    },
  },
});

// 3. Get average rating and stats
const reviewStats = await prisma.review.aggregate({
  where: {
    approved: true,
  },
  _avg: {
    rating: true,
  },
  _count: {
    id: true,
  },
});
```

### Medical Patient Queries

```typescript
// 1. Get medical patient with communication preferences
const medicalPatient = await prisma.medicalPatient.findUnique({
  where: { cpf: cpf },
  include: {
    communicationContact: {
      select: {
        name: true,
        email: true,
        whatsapp: true,
        emailPreferences: true,
        whatsappPreferences: true,
      },
    },
    appointments: {
      orderBy: { date: 'desc' },
      take: 5,
    },
    consultations: {
      orderBy: { startTime: 'desc' },
      take: 5,
    },
  },
});

// 2. Check if contact is medical patient
const contactWithPatient = await prisma.communicationContact.findUnique({
  where: { email: email },
  include: {
    medicalPatients: {
      select: {
        id: true,
        cpf: true,
        medicalRecordNumber: true,
      },
    },
  },
});

const isMedicalPatient = contactWithPatient?.medicalPatients.length > 0;
```

## Benefits of New Architecture

1. **Clear Separation**: Contact communication vs. medical records
2. **No Data Duplication**: Single source of truth for each data type
3. **Flexible Querying**: Easy to find newsletter subscribers, WhatsApp contacts, medical patients
4. **Better Performance**: Indexed queries, no JSON parsing needed
5. **Data Integrity**: Foreign key constraints ensure consistency
6. **LGPD Compliance**: Clear consent tracking per contact
7. **Scalability**: Separate tables allow independent scaling
8. **Maintainability**: Clear data model is easier to understand and modify

## Implementation Checklist

- [ ] Create migration for new models (`RegistrationSource`, `Review`)
- [ ] Write data migration scripts
- [ ] Update `lib/unified-patient-system.ts` to use Prisma instead of JSON files
- [ ] Update API routes:
  - [ ] `/api/newsletter` - use new CommunicationContact queries
  - [ ] `/api/reviews` - use new Review model
  - [ ] `/api/public-appointment` - use new flow
  - [ ] `/api/unified-system/communication` - update for new schema
- [ ] Remove deprecated code:
  - [ ] JSON file storage in `lib/unified-patient-system.ts`
  - [ ] NewsletterSubscriber references
- [ ] Update frontend components to use new API structure
- [ ] Write tests for new architecture
- [ ] Deploy migration to production with rollback plan
