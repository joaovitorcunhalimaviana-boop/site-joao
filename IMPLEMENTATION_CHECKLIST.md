# Implementation Checklist - Patient/Contact Architecture Redesign

## Pre-Migration Phase (2-3 hours)

### Step 1: Backup Everything
- [ ] Create full database backup
  ```bash
  pg_dump -h localhost -U postgres -d medical_db -F c -b -v -f backup_pre_migration.dump
  ```
- [ ] Backup JSON data files (if migration fails)
  ```bash
  cp -r data/unified-system data/unified-system.backup
  ```
- [ ] Take snapshot of current codebase
  ```bash
  git tag -a pre-migration -m "Before architecture redesign"
  git push --tags
  ```

### Step 2: Test Environment Setup
- [ ] Clone production database to staging
  ```bash
  pg_restore -h staging -U postgres -d medical_db_staging backup_pre_migration.dump
  ```
- [ ] Run migration on staging
  ```bash
  psql -h staging -U postgres -d medical_db_staging -f prisma/migrations/redesign_communication_medical_separation.sql
  ```
- [ ] Verify staging data integrity
  - [ ] Check record counts match
  - [ ] Verify no orphaned records
  - [ ] Test foreign key constraints

### Step 3: Code Review
- [ ] Review new Prisma schema (`prisma/schema-redesigned.prisma`)
- [ ] Review migration SQL script
- [ ] Review API implementation guide
- [ ] Identify all affected API routes
- [ ] Create rollback plan document

---

## Migration Phase (30-60 minutes)

### Step 4: Database Migration
- [ ] **Notify users** of maintenance window (if applicable)
- [ ] **Set application to read-only mode** (optional)
- [ ] **Run migration script**
  ```bash
  psql -h localhost -U postgres -d medical_db -f prisma/migrations/redesign_communication_medical_separation.sql
  ```
- [ ] **Verify migration success**
  - [ ] Check migration output for errors
  - [ ] Verify record counts:
    ```sql
    SELECT 'CommunicationContacts' as table_name, COUNT(*) FROM communication_contacts
    UNION ALL
    SELECT 'RegistrationSources', COUNT(*) FROM registration_sources
    UNION ALL
    SELECT 'Reviews', COUNT(*) FROM reviews
    UNION ALL
    SELECT 'MedicalPatients', COUNT(*) FROM medical_patients
    UNION ALL
    SELECT 'Appointments', COUNT(*) FROM appointments;
    ```
  - [ ] Check for orphaned records:
    ```sql
    -- Should return 0 rows
    SELECT * FROM appointments a
    WHERE NOT EXISTS (
      SELECT 1 FROM communication_contacts cc WHERE cc.id = a.communicationContactId
    );
    ```

### Step 5: Update Prisma Schema
- [ ] Replace `prisma/schema.prisma` with `prisma/schema-redesigned.prisma`
  ```bash
  cp prisma/schema-redesigned.prisma prisma/schema.prisma
  ```
- [ ] Generate Prisma client
  ```bash
  npx prisma generate
  ```
- [ ] Verify Prisma client types are correct
  ```bash
  npx tsc --noEmit
  ```

---

## Code Update Phase (2-3 hours)

### Step 6: Create Prisma Client Instance
- [ ] Create `lib/prisma.ts` (if doesn't exist)
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = global as unknown as { prisma: PrismaClient }

  export const prisma = globalForPrisma.prisma || new PrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

### Step 7: Update Newsletter API
- [ ] Update `/api/newsletter/route.ts`
  - [ ] Replace JSON file reads with Prisma queries
  - [ ] Use `CommunicationContact` model for subscribers
  - [ ] Update subscription logic to use `RegistrationSource`
  - [ ] Test GET endpoint (list subscribers)
  - [ ] Test POST endpoint (subscribe)
  - [ ] Test PUT endpoint (update preferences)
  - [ ] Test DELETE endpoint (unsubscribe)

### Step 8: Update Public Appointment API
- [ ] Update `/api/public-appointment/route.ts`
  - [ ] Replace JSON file operations with Prisma transactions
  - [ ] Use proper foreign keys for patient references
  - [ ] Remove duplicate patient data fields
  - [ ] Add CPF validation before database insert
  - [ ] Test with new patient (creates all records)
  - [ ] Test with existing patient (uses existing records)
  - [ ] Verify Telegram notifications still work

### Step 9: Update Reviews API
- [ ] Update `/api/reviews/route.ts`
  - [ ] Use new `Review` model instead of `CommunicationContact` fields
  - [ ] Update review creation to use transaction
  - [ ] Create `RegistrationSource` for review submissions
  - [ ] Test GET endpoint (list reviews)
  - [ ] Test POST endpoint (create review)
  - [ ] Test review statistics aggregation
  - [ ] Verify Telegram notifications still work

### Step 10: Update Communication Contact API
- [ ] Update `/api/unified-system/communication/route.ts`
  - [ ] Update GET to include `registrationSources` and `reviews`
  - [ ] Update PUT to handle preference changes correctly
  - [ ] Add proper error handling for foreign key violations
  - [ ] Test fetching contact by ID
  - [ ] Test fetching contact by email
  - [ ] Test listing contacts with filters
  - [ ] Test updating communication preferences

### Step 11: Update Medical Patient APIs
- [ ] Update `/api/unified-system/medical-patients/[id]/route.ts`
  - [ ] Ensure deletion cascades correctly
  - [ ] Verify foreign key constraints
  - [ ] Test patient deletion (should remove appointments, records, etc.)

### Step 12: Remove JSON File Dependencies
- [ ] Update `lib/unified-patient-system.ts`
  - [ ] Remove all JSON file operations
  - [ ] Keep only utility functions (CPF validation, etc.)
  - [ ] Add Prisma-based helper functions
  - [ ] Update exports to use Prisma models
- [ ] Remove or archive JSON data files (after verification)
  ```bash
  mkdir -p data/archived
  mv data/unified-system/*.json data/archived/
  ```

### Step 13: Update Helper Functions
- [ ] Update notification functions to use Prisma data
  - [ ] `sendTelegramAppointmentNotification`
  - [ ] `sendTelegramNewsletterNotification`
  - [ ] `sendTelegramReviewNotification`
- [ ] Update any scheduled jobs/cron tasks
  - [ ] Daily agenda notifications
  - [ ] Appointment reminders
  - [ ] Newsletter sending

---

## Testing Phase (2-3 hours)

### Step 14: Unit Tests
- [ ] Test database models
  - [ ] CommunicationContact CRUD
  - [ ] MedicalPatient CRUD
  - [ ] Appointment CRUD
  - [ ] Review CRUD
  - [ ] RegistrationSource creation

### Step 15: Integration Tests
- [ ] **Newsletter Flow**
  - [ ] Subscribe to newsletter
  - [ ] Verify contact created
  - [ ] Verify registration source added
  - [ ] Verify preferences saved correctly
  - [ ] Unsubscribe from newsletter
  - [ ] Re-subscribe to newsletter

- [ ] **Public Appointment Flow**
  - [ ] Create appointment with new patient (CPF)
  - [ ] Verify contact created
  - [ ] Verify medical patient created
  - [ ] Verify appointment linked correctly
  - [ ] Create appointment with existing patient
  - [ ] Verify no duplicate records

- [ ] **Review Flow**
  - [ ] Submit review
  - [ ] Verify contact created/updated
  - [ ] Verify review record created
  - [ ] Verify registration source added
  - [ ] Verify review appears in list
  - [ ] Test review moderation (approve/reject)

- [ ] **Medical Patient Flow**
  - [ ] Create medical patient via doctor area
  - [ ] Verify communication contact linked
  - [ ] Create appointment for medical patient
  - [ ] Delete medical patient
  - [ ] Verify cascade deletion works

### Step 16: Query Performance Tests
- [ ] Benchmark newsletter subscriber query
  ```typescript
  console.time('Newsletter Query')
  const subscribers = await prisma.communicationContact.findMany({
    where: { emailNewsletter: true, emailSubscribed: true }
  })
  console.timeEnd('Newsletter Query')
  ```
- [ ] Benchmark CPF lookup query
  ```typescript
  console.time('CPF Lookup')
  const patient = await prisma.medicalPatient.findUnique({
    where: { cpf: cpf },
    include: { communicationContact: true }
  })
  console.timeEnd('CPF Lookup')
  ```
- [ ] Verify all queries < 100ms

### Step 17: Notification Tests
- [ ] Test Telegram notifications
  - [ ] Newsletter subscription notification
  - [ ] Appointment creation notification
  - [ ] Review submission notification
  - [ ] Daily agenda notification
- [ ] Test WhatsApp notifications (if configured)
  - [ ] Appointment confirmation
  - [ ] Appointment reminder

---

## Deployment Phase (1 hour)

### Step 18: Pre-Deployment Checks
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Migration tested on staging
- [ ] Rollback plan documented and tested
- [ ] Team notified of deployment

### Step 19: Production Deployment
- [ ] **Create production database backup** (again, just before deployment)
  ```bash
  pg_dump -h localhost -U postgres -d medical_db -F c -b -v -f backup_final_pre_migration.dump
  ```
- [ ] **Deploy database migration**
  ```bash
  psql -h production -U postgres -d medical_db -f prisma/migrations/redesign_communication_medical_separation.sql
  ```
- [ ] **Verify migration success** (same checks as Step 4)
- [ ] **Deploy application code**
  ```bash
  git checkout main
  git pull origin main
  npm install
  npx prisma generate
  npm run build
  pm2 restart medical-app
  ```
- [ ] **Verify application startup**
  ```bash
  pm2 logs medical-app --lines 100
  ```

### Step 20: Smoke Tests (Production)
- [ ] Test homepage loads
- [ ] Test newsletter signup form
- [ ] Test public appointment form
- [ ] Test review submission form
- [ ] Test doctor login
- [ ] Test patient list in doctor area
- [ ] Verify no console errors
- [ ] Check application logs for errors

---

## Post-Deployment Phase (24-48 hours)

### Step 21: Monitoring
- [ ] **Hour 1**: Monitor every 5 minutes
  - [ ] Check application logs
  - [ ] Check database performance
  - [ ] Monitor error rates
  - [ ] Check notification delivery

- [ ] **Hours 2-8**: Monitor every 30 minutes
  - [ ] Verify newsletter subscriptions working
  - [ ] Verify appointments being created
  - [ ] Verify reviews being submitted
  - [ ] Check database query performance

- [ ] **Hours 9-24**: Monitor every 2 hours
  - [ ] Check for any orphaned records
  - [ ] Verify data integrity
  - [ ] Monitor database size

- [ ] **Hours 25-48**: Monitor every 4 hours
  - [ ] Final data integrity check
  - [ ] Performance optimization if needed
  - [ ] Document any issues encountered

### Step 22: Performance Optimization
- [ ] Review slow query log
- [ ] Add additional indexes if needed
  ```sql
  -- Example: If WhatsApp queries are slow
  CREATE INDEX IF NOT EXISTS idx_contacts_whatsapp_subscribed
  ON communication_contacts(whatsapp_subscribed, whatsapp);
  ```
- [ ] Optimize Prisma queries with better includes/selects
- [ ] Enable query caching if needed

### Step 23: Cleanup
- [ ] Remove deprecated JSON files (after 1 week of stable operation)
  ```bash
  rm -rf data/unified-system/*.json
  ```
- [ ] Remove old migration backups (after 1 month)
  ```bash
  rm backup_pre_migration.dump backup_final_pre_migration.dump
  ```
- [ ] Archive old code (if any legacy code remains)
- [ ] Update documentation

---

## Rollback Procedures

### If Issues Found Within First Hour

#### Option 1: Full Rollback (Fastest - 5 minutes)
```bash
# Stop application
pm2 stop medical-app

# Restore database from backup
pg_restore -h localhost -U postgres -d medical_db --clean backup_final_pre_migration.dump

# Revert code
git revert HEAD
git push origin main

# Deploy old code
npm install
npm run build
pm2 start medical-app
```

#### Option 2: Partial Rollback via SQL (15 minutes)
Run the rollback section from `redesign_communication_medical_separation.sql`:
```bash
psql -h localhost -U postgres -d medical_db <<EOF
-- Run rollback SQL (commented section at end of migration file)
BEGIN;
-- ... rollback SQL commands ...
COMMIT;
EOF
```

### If Issues Found After Hours/Days

- [ ] Document the issue thoroughly
- [ ] Determine if it's data or code issue
- [ ] If data issue: Fix with targeted SQL update
- [ ] If code issue: Deploy hotfix
- [ ] If critical: Consider partial rollback of affected areas only

---

## Success Criteria

### Data Integrity ✓
- [ ] No orphaned appointments (all have valid contactId)
- [ ] No orphaned medical patients (all have valid contactId)
- [ ] All reviews linked to valid contacts
- [ ] All registration sources linked to valid contacts
- [ ] Record counts match pre-migration + new records

### Performance ✓
- [ ] Newsletter query < 50ms
- [ ] CPF lookup < 20ms
- [ ] Appointment creation < 100ms
- [ ] Review submission < 80ms
- [ ] All API endpoints respond < 200ms

### Functionality ✓
- [ ] Newsletter signup works
- [ ] Public appointment works (new and existing patients)
- [ ] Review submission works
- [ ] Medical patient creation works
- [ ] All notifications delivered
- [ ] WhatsApp/Email preferences respected
- [ ] Data deletion works (with cascade)

### User Experience ✓
- [ ] No user-facing errors
- [ ] All forms submit successfully
- [ ] Confirmation messages displayed
- [ ] Emails delivered
- [ ] WhatsApp messages sent
- [ ] Doctor dashboard loads correctly

---

## Emergency Contacts

### If Issues Arise
1. **Database Issues**: DBA or senior backend developer
2. **Application Errors**: Lead developer
3. **Notification Failures**: Check Telegram/WhatsApp configuration
4. **Performance Issues**: Check database indexes and query logs

### Rollback Decision Tree
```
Issue Detected
    ↓
Is it critical? (Blocking core functionality)
    ↓ YES → ROLLBACK immediately
    ↓ NO
    ↓
Can it be hotfixed in < 30 min?
    ↓ YES → Deploy hotfix
    ↓ NO → ROLLBACK
```

---

## Sign-Off

### Pre-Migration
- [ ] Database backup verified
- [ ] Staging environment tested
- [ ] Code reviewed and approved
- [ ] Team briefed on migration plan
- [ ] Rollback procedures tested

**Approved by**: _________________ **Date**: _________________

### Post-Migration
- [ ] Migration completed successfully
- [ ] All smoke tests passed
- [ ] 24-hour monitoring completed
- [ ] No critical issues found
- [ ] Performance targets met

**Approved by**: _________________ **Date**: _________________

---

## Lessons Learned (Fill after migration)

### What Went Well
-
-
-

### What Could Be Improved
-
-
-

### Action Items for Next Migration
-
-
-

---

**Document Version**: 1.0
**Last Updated**: 2025-10-08
**Migration Owner**: [Your Name]
**Next Review**: After migration completion
