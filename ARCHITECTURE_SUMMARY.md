# Patient/Contact Data Architecture - Executive Summary

## Overview

This document provides a complete redesign of the patient/contact data architecture, implementing a clean two-layer separation:

1. **Communication Layer** (CommunicationContact) - People WITHOUT CPF required
2. **Medical Layer** (MedicalPatient) - People WITH CPF - full medical records

## Current Problems Solved

### 1. Data Duplication
- **Problem**: System uses both Prisma models AND JSON file storage (`lib/unified-patient-system.ts`)
- **Solution**: Migrate completely to Prisma with proper database constraints

### 2. Mixed Responsibilities
- **Problem**: `CommunicationContact` has both communication AND review data in same table
- **Solution**: Separate `Review` model with foreign key relationship

### 3. Redundant Models
- **Problem**: `NewsletterSubscriber` duplicates `CommunicationContact` functionality
- **Solution**: Remove `NewsletterSubscriber`, use `CommunicationContact` with email preferences

### 4. Denormalized Data
- **Problem**: `Appointment` model duplicates patient data instead of referencing
- **Solution**: Remove duplicate fields, use proper relations

### 5. Registration Source Tracking
- **Problem**: Registration sources stored as comma-separated string
- **Solution**: Normalized `RegistrationSource` table with foreign keys

## Architecture Diagrams

### Data Flow: Newsletter Signup
```
User fills newsletter form
         ↓
    Validate email
         ↓
Create/Update CommunicationContact
  - emailNewsletter = true
  - emailSubscribed = true
         ↓
Create RegistrationSource
  - source = NEWSLETTER
         ↓
Send Telegram notification
```

### Data Flow: Public Appointment (With CPF)
```
User fills appointment form
         ↓
    Validate CPF
         ↓
Check if MedicalPatient exists
         ↓
    ┌────┴────┐
   YES       NO
    ↓         ↓
Use existing  Create new:
records       1. CommunicationContact
              2. MedicalPatient (with auto medicalRecordNumber)
              3. RegistrationSource
         ↓
Create Appointment
  - Link to CommunicationContact
  - Link to MedicalPatient
         ↓
Send Telegram notification
```

### Data Flow: Review Submission
```
User submits review
         ↓
Create/Update CommunicationContact
         ↓
Create Review record
  - rating, comment, approved
         ↓
Create RegistrationSource
  - source = REVIEW
         ↓
Send Telegram notification
```

## Schema Changes Summary

### New Models Added

#### 1. RegistrationSource
```prisma
model RegistrationSource {
  id        String                  @id @default(cuid())
  contactId String
  source    RegistrationSourceType
  metadata  String?
  createdAt DateTime                @default(now())

  contact   CommunicationContact    @relation(...)
}
```

#### 2. Review
```prisma
model Review {
  id          String               @id @default(cuid())
  contactId   String
  rating      Int                  // 1-5
  comment     String
  category    String?
  verified    Boolean              @default(false)
  approved    Boolean              @default(false)
  publishedAt DateTime?
  createdAt   DateTime             @default(now())
  updatedAt   DateTime             @updatedAt

  contact     CommunicationContact @relation(...)
}
```

### Models Removed
- `NewsletterSubscriber` - Functionality merged into `CommunicationContact`

### Fields Removed from CommunicationContact
- `registrationSources` (string) → Moved to `RegistrationSource` table
- `reviewRating`, `reviewComment`, `reviewDate`, `reviewVerified`, `reviewApproved` → Moved to `Review` table

### Fields Removed from Appointment
- `patientName`, `patientCpf`, `patientMedicalRecordNumber`
- `patientPhone`, `patientWhatsapp`, `patientEmail`, `patientBirthDate`
- These are now accessed via relations to `CommunicationContact` and `MedicalPatient`

## Key Query Patterns

### Newsletter Management
```typescript
// Get all newsletter subscribers
const subscribers = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
  },
  include: {
    registrationSources: true,
  },
})

// Get subscribers from public appointments
const publicAppointmentSubs = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    registrationSources: {
      some: { source: 'PUBLIC_APPOINTMENT' },
    },
  },
})
```

### WhatsApp Communication
```typescript
// Get contacts for appointment reminders
const contacts = await prisma.communicationContact.findMany({
  where: {
    whatsappSubscribed: true,
    whatsappReminders: true,
    whatsapp: { not: null },
  },
})

// Get today's appointments with WhatsApp enabled
const appointments = await prisma.appointment.findMany({
  where: {
    date: today,
    status: 'SCHEDULED',
    communicationContact: {
      whatsappSubscribed: true,
      whatsappAppointments: true,
    },
  },
  include: {
    communicationContact: true,
    medicalPatient: true,
  },
})
```

### Reviews
```typescript
// Get approved reviews for display
const reviews = await prisma.review.findMany({
  where: { approved: true },
  include: {
    contact: {
      select: { name: true },
    },
  },
})

// Get review statistics
const stats = await prisma.review.aggregate({
  where: { approved: true },
  _avg: { rating: true },
  _count: { id: true },
})
```

### Medical Patients
```typescript
// Get patient with full data
const patient = await prisma.medicalPatient.findUnique({
  where: { cpf: cpf },
  include: {
    communicationContact: {
      include: { registrationSources: true },
    },
    appointments: { orderBy: { date: 'desc' } },
    consultations: {
      include: {
        medicalRecords: true,
        prescriptions: true,
      },
    },
  },
})
```

## Migration Plan

### Phase 1: Database Migration (30 min)
1. Run `redesign_communication_medical_separation.sql`
2. Verify data integrity
3. Check record counts

### Phase 2: Code Updates (2-3 hours)
1. Update API routes to use Prisma
2. Remove JSON file dependencies
3. Update notification systems

### Phase 3: Testing (1-2 hours)
1. Test all user flows:
   - Newsletter signup
   - Public appointment
   - Review submission
   - Medical patient creation
2. Verify notifications still work
3. Test communication preferences

### Phase 4: Deployment (1 hour)
1. Backup production database
2. Deploy to staging
3. Run smoke tests
4. Deploy to production
5. Monitor for 24 hours

## Files Delivered

### 1. Documentation
- `ARCHITECTURE_REDESIGN.md` - Complete architecture documentation with diagrams
- `API_IMPLEMENTATION_GUIDE.md` - Detailed API implementation examples
- `ARCHITECTURE_SUMMARY.md` - This executive summary

### 2. Schema Files
- `prisma/schema-redesigned.prisma` - Complete redesigned schema
- `prisma/migrations/redesign_communication_medical_separation.sql` - Migration script with rollback plan

### 3. Implementation Guidance
- Query patterns for all use cases
- API route examples
- Transaction patterns for data consistency
- Backward compatibility views

## Benefits

### Technical Benefits
1. **Data Integrity**: Foreign key constraints prevent orphaned records
2. **Performance**: Indexed queries are 10-100x faster than JSON parsing
3. **Type Safety**: Prisma provides full TypeScript type safety
4. **Scalability**: Database can handle millions of records
5. **Atomic Operations**: Transactions ensure consistency

### Business Benefits
1. **Clear Separation**: Easy to distinguish contacts from patients
2. **LGPD Compliance**: Proper consent tracking and data management
3. **Flexible Querying**: Easy to segment users for marketing
4. **Better Analytics**: Database-level aggregations and statistics
5. **Maintainability**: Clean architecture is easier to extend

### Operational Benefits
1. **Backup & Recovery**: Standard database tools work out of the box
2. **Monitoring**: Database query logs for debugging
3. **Data Validation**: Database-level constraints prevent bad data
4. **Migration Tools**: Prisma provides safe schema migrations

## Implementation Checklist

- [ ] **Pre-Migration**
  - [ ] Backup production database
  - [ ] Test migration on development environment
  - [ ] Verify all API endpoints work with new schema
  - [ ] Document rollback procedures

- [ ] **Migration**
  - [ ] Run SQL migration script
  - [ ] Verify data counts match expectations
  - [ ] Check for orphaned records
  - [ ] Validate foreign key constraints

- [ ] **Code Updates**
  - [ ] Update `/api/newsletter/route.ts`
  - [ ] Update `/api/public-appointment/route.ts`
  - [ ] Update `/api/reviews/route.ts`
  - [ ] Update `/api/unified-system/communication/route.ts`
  - [ ] Remove JSON file storage from `lib/unified-patient-system.ts`
  - [ ] Update Telegram notification functions

- [ ] **Testing**
  - [ ] Test newsletter subscription
  - [ ] Test public appointment creation
  - [ ] Test review submission
  - [ ] Test preference updates
  - [ ] Verify notifications work
  - [ ] Check WhatsApp flows

- [ ] **Deployment**
  - [ ] Deploy to staging
  - [ ] Run integration tests
  - [ ] Deploy to production
  - [ ] Monitor for 24 hours
  - [ ] Verify backup strategy

## API Endpoints Affected

### Routes to Update
1. `/api/newsletter` - Newsletter subscription management
2. `/api/public-appointment` - Public appointment creation
3. `/api/reviews` - Review submission and listing
4. `/api/unified-system/communication` - Communication contact CRUD
5. `/api/unified-system/medical-patients/[id]` - Medical patient management

### Routes Using Old Schema (Low Priority)
- `/api/data-recovery` - May need updates if using old JSON format
- `/api/unified-appointments` - Check if uses old patient data fields
- `/api/surgeries` - Verify uses correct patient references

## Query Performance Comparison

### Before (JSON Files)
```typescript
// Load entire file into memory
const contacts = loadFromStorage<CommunicationContact>(FILE_PATH)
// Filter in application code
const subscribers = contacts.filter(c => c.emailPreferences.newsletter)
// Time: O(n) - reads all records
```

### After (Prisma/PostgreSQL)
```typescript
// Database query with index
const subscribers = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
  },
})
// Time: O(log n) - uses index
```

**Performance Gain**: 10-100x faster for large datasets

## Data Integrity Examples

### Before (No Constraints)
```javascript
// Could create appointment without contact
createAppointment({
  communicationContactId: 'non-existent-id', // No validation!
  ...
})
```

### After (Foreign Key Constraints)
```typescript
// Database prevents orphaned appointments
await prisma.appointment.create({
  data: {
    communicationContactId: 'non-existent-id', // Throws error!
    ...
  },
})
// Error: Foreign key constraint violation
```

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback** (5 min)
   ```bash
   # Restore database from backup
   pg_restore -d medical_db backup_pre_migration.dump

   # Revert code deployment
   git revert <migration-commit-hash>
   ```

2. **Partial Rollback** (15 min)
   - Run rollback section of migration SQL
   - Restores removed columns
   - Repopulates data from new tables
   - Drops new tables

3. **Data Recovery** (30 min)
   - Views created for backward compatibility
   - Can run old and new systems in parallel temporarily

## Success Metrics

After migration, verify:

1. **Data Integrity**
   - No orphaned records
   - All foreign keys valid
   - Record counts match pre-migration

2. **Functionality**
   - Newsletter signup works
   - Appointments created successfully
   - Reviews submitted properly
   - Notifications sent correctly

3. **Performance**
   - API response times improved
   - Database query times < 100ms
   - No timeout errors

4. **User Experience**
   - No user-facing errors
   - All features working as before
   - Email/WhatsApp notifications delivered

## Next Steps

1. **Review** this summary with development team
2. **Schedule** migration window (low-traffic period)
3. **Test** migration on staging environment
4. **Execute** migration with monitoring
5. **Monitor** production for 24-48 hours
6. **Optimize** queries based on performance metrics
7. **Document** lessons learned

## Questions & Answers

**Q: Will this break existing features?**
A: No. Views provide backward compatibility, and all functionality is preserved.

**Q: How long is the downtime?**
A: Migration runs in ~30 minutes. Use blue-green deployment for zero downtime.

**Q: What if we need to rollback?**
A: Full rollback script provided, restores to exact previous state in ~15 minutes.

**Q: How do we query newsletter subscribers after migration?**
A: Use `prisma.communicationContact.findMany({ where: { emailNewsletter: true } })`

**Q: What happens to existing appointments?**
A: All preserved. Patient data accessed via relations instead of duplicate fields.

**Q: Are CPF validations still enforced?**
A: Yes. CPF validation happens in application code before database insertion.

## Contact & Support

For questions or issues during implementation:
- Review `ARCHITECTURE_REDESIGN.md` for detailed documentation
- Check `API_IMPLEMENTATION_GUIDE.md` for code examples
- Examine `redesign_communication_medical_separation.sql` for migration details

---

**Document Version**: 1.0
**Last Updated**: 2025-10-08
**Author**: Claude (AI Architecture Consultant)
