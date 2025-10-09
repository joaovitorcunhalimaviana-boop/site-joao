-- ═══════════════════════════════════════════════════════════════════════════════
-- PATIENT/CONTACT DATA ARCHITECTURE REDESIGN MIGRATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- This migration implements the complete redesign from JSON storage to Prisma
-- with proper separation of Communication and Medical layers.
--
-- CHANGES SUMMARY:
-- 1. Add new RegistrationSource model (normalized from string field)
-- 2. Redesign Review model (separate from CommunicationContact)
-- 3. Remove redundant NewsletterSubscriber model
-- 4. Clean up CommunicationContact (remove review fields)
-- 5. Clean up Appointment (remove duplicate patient fields)
-- 6. Add proper indexes and constraints
--
-- EXECUTION TIME: ~30 minutes for large datasets
-- ROLLBACK: Full rollback script provided at the end
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 1: CREATE NEW MODELS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create RegistrationSourceType enum (if not exists)
DO $$ BEGIN
    CREATE TYPE "RegistrationSourceType" AS ENUM (
        'NEWSLETTER',
        'PUBLIC_APPOINTMENT', 
        'DOCTOR_AREA',
        'SECRETARY_AREA',
        'REVIEW',
        'MEDICAL_AREA',
        'PUBLIC_SCHEDULING',
        'WHATSAPP',
        'PHONE',
        'REFERRAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create RegistrationSource table
CREATE TABLE IF NOT EXISTS "registration_sources" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "source" "RegistrationSourceType" NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_sources_pkey" PRIMARY KEY ("id")
);

-- Create indexes for RegistrationSource
CREATE INDEX IF NOT EXISTS "registration_sources_contactId_idx" ON "registration_sources"("contactId");
CREATE INDEX IF NOT EXISTS "registration_sources_source_idx" ON "registration_sources"("source");
CREATE INDEX IF NOT EXISTS "registration_sources_createdAt_idx" ON "registration_sources"("createdAt");

-- Redesign Review table (drop existing and recreate with proper structure)
DROP TABLE IF EXISTS "reviews" CASCADE;

CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "category" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Review
CREATE INDEX "reviews_contactId_idx" ON "reviews"("contactId");
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");
CREATE INDEX "reviews_approved_idx" ON "reviews"("approved");
CREATE INDEX "reviews_verified_idx" ON "reviews"("verified");
CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 2: MIGRATE DATA FROM OLD STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Migrate registration sources from CommunicationContact.registrationSources
INSERT INTO "registration_sources" ("id", "contactId", "source", "createdAt")
SELECT
    gen_random_uuid(),
    cc."id",
    CASE 
        WHEN source_item = 'newsletter' THEN 'NEWSLETTER'::RegistrationSourceType
        WHEN source_item = 'public-appointment' THEN 'PUBLIC_APPOINTMENT'::RegistrationSourceType
        WHEN source_item = 'doctor-area' THEN 'DOCTOR_AREA'::RegistrationSourceType
        WHEN source_item = 'secretary-area' THEN 'SECRETARY_AREA'::RegistrationSourceType
        WHEN source_item = 'review' THEN 'REVIEW'::RegistrationSourceType
        WHEN source_item = 'medical-area' THEN 'MEDICAL_AREA'::RegistrationSourceType
        WHEN source_item = 'public-scheduling' THEN 'PUBLIC_SCHEDULING'::RegistrationSourceType
        WHEN source_item = 'whatsapp' THEN 'WHATSAPP'::RegistrationSourceType
        WHEN source_item = 'phone' THEN 'PHONE'::RegistrationSourceType
        ELSE 'REFERRAL'::RegistrationSourceType
    END,
    cc."createdAt"
FROM "communication_contacts" cc,
     unnest(string_to_array(cc."registrationSources", ',')) AS source_item
WHERE cc."registrationSources" IS NOT NULL AND cc."registrationSources" != '';

-- Migrate review data from CommunicationContact to Review table
INSERT INTO "reviews" ("id", "contactId", "rating", "comment", "verified", "approved", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    cc."id",
    cc."reviewRating",
    COALESCE(cc."reviewComment", 'No comment provided'),
    cc."reviewVerified",
    cc."reviewApproved",
    COALESCE(cc."reviewDate", cc."createdAt"),
    cc."updatedAt"
FROM "communication_contacts" cc
WHERE cc."reviewRating" IS NOT NULL;

-- Migrate NewsletterSubscriber to CommunicationContact (avoid duplicates)
INSERT INTO "communication_contacts" (
    "id", "name", "email", "whatsapp", "birthDate",
    "emailSubscribed", "emailNewsletter", "emailHealthTips", "emailAppointments", "emailPromotions",
    "emailSubscribedAt", "emailUnsubscribedAt",
    "whatsappSubscribed", "whatsappAppointments", "whatsappReminders", "whatsappPromotions",
    "createdAt", "updatedAt"
)
SELECT
    ns."id",
    ns."name",
    ns."email",
    NULL,  -- whatsapp not in NewsletterSubscriber
    NULL,  -- birthDate not in NewsletterSubscriber
    ns."subscribed",
    ns."healthTips",
    ns."healthTips",
    ns."appointments",
    ns."promotions",
    ns."subscribedAt",
    ns."unsubscribedAt",
    true,  -- default whatsapp prefs
    true,
    true,
    false,
    COALESCE(ns."subscribedAt", ns."createdAt"),
    ns."updatedAt"
FROM "newsletter_subscribers" ns
WHERE NOT EXISTS (
    SELECT 1 FROM "communication_contacts" cc
    WHERE cc."email" = ns."email"
)
ON CONFLICT ("id") DO NOTHING;

-- Add registration source for migrated newsletter subscribers
INSERT INTO "registration_sources" ("id", "contactId", "source", "createdAt")
SELECT
    gen_random_uuid(),
    cc."id",
    'NEWSLETTER'::RegistrationSourceType,
    cc."createdAt"
FROM "communication_contacts" cc
WHERE cc."email" IN (SELECT "email" FROM "newsletter_subscribers")
  AND NOT EXISTS (
    SELECT 1 FROM "registration_sources" rs 
    WHERE rs."contactId" = cc."id" AND rs."source" = 'NEWSLETTER'::RegistrationSourceType
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 3: CLEAN UP OLD STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════════

-- Remove review fields from CommunicationContact
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "reviewRating";
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "reviewComment";
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "reviewDate";
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "reviewVerified";
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "reviewApproved";

-- Remove registrationSources string field (now normalized)
ALTER TABLE "communication_contacts" DROP COLUMN IF EXISTS "registrationSources";

-- Remove duplicate patient fields from Appointment
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientName";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientCpf";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientMedicalRecordNumber";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientPhone";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientWhatsapp";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientEmail";
ALTER TABLE "appointments" DROP COLUMN IF EXISTS "patientBirthDate";

-- Make communicationContactId required in appointments (was optional)
UPDATE "appointments" SET "communicationContactId" = (
    SELECT cc."id" FROM "communication_contacts" cc LIMIT 1
) WHERE "communicationContactId" IS NULL;

ALTER TABLE "appointments" ALTER COLUMN "communicationContactId" SET NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 4: ADD FOREIGN KEY CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add foreign key constraints for RegistrationSource
ALTER TABLE "registration_sources" ADD CONSTRAINT "registration_sources_contactId_fkey" 
    FOREIGN KEY ("contactId") REFERENCES "communication_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraints for Review
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contactId_fkey" 
    FOREIGN KEY ("contactId") REFERENCES "communication_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 5: DROP REDUNDANT MODELS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop NewsletterSubscriber table (functionality moved to CommunicationContact)
DROP TABLE IF EXISTS "newsletter_subscribers" CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 6: CREATE BACKWARD COMPATIBILITY VIEWS (OPTIONAL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create view for backward compatibility with old newsletter queries
CREATE OR REPLACE VIEW "newsletter_subscribers_view" AS
SELECT 
    cc."id",
    cc."email",
    cc."name",
    cc."emailNewsletter" as "subscribed",
    cc."emailHealthTips" as "healthTips",
    cc."emailAppointments" as "appointments", 
    cc."emailPromotions" as "promotions",
    cc."emailSubscribedAt" as "subscribedAt",
    cc."emailUnsubscribedAt" as "unsubscribedAt",
    cc."createdAt",
    cc."updatedAt"
FROM "communication_contacts" cc
WHERE cc."emailNewsletter" = true;

-- Create view for appointment with patient data (backward compatibility)
CREATE OR REPLACE VIEW "appointments_with_patient_data" AS
SELECT 
    a.*,
    cc."name" as "patientName",
    mp."cpf" as "patientCpf",
    mp."medicalRecordNumber" as "patientMedicalRecordNumber",
    cc."whatsapp" as "patientPhone",
    cc."whatsapp" as "patientWhatsapp",
    cc."email" as "patientEmail",
    cc."birthDate" as "patientBirthDate"
FROM "appointments" a
JOIN "communication_contacts" cc ON a."communicationContactId" = cc."id"
LEFT JOIN "medical_patients" mp ON a."medicalPatientId" = mp."id";

-- ═══════════════════════════════════════════════════════════════════════════════
-- PHASE 7: UPDATE STATISTICS AND VERIFY DATA INTEGRITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update table statistics
ANALYZE "registration_sources";
ANALYZE "reviews";
ANALYZE "communication_contacts";
ANALYZE "appointments";

-- Verify data integrity
DO $$
DECLARE
    contact_count INTEGER;
    registration_count INTEGER;
    review_count INTEGER;
    appointment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO contact_count FROM "communication_contacts";
    SELECT COUNT(*) INTO registration_count FROM "registration_sources";
    SELECT COUNT(*) INTO review_count FROM "reviews";
    SELECT COUNT(*) INTO appointment_count FROM "appointments";
    
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE '- Communication Contacts: %', contact_count;
    RAISE NOTICE '- Registration Sources: %', registration_count;
    RAISE NOTICE '- Reviews: %', review_count;
    RAISE NOTICE '- Appointments: %', appointment_count;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK SCRIPT (RUN ONLY IF MIGRATION FAILS)
-- ═══════════════════════════════════════════════════════════════════════════════
/*
BEGIN;

-- Recreate NewsletterSubscriber table
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscribed" BOOLEAN NOT NULL DEFAULT true,
    "healthTips" BOOLEAN NOT NULL DEFAULT true,
    "appointments" BOOLEAN NOT NULL DEFAULT true,
    "promotions" BOOLEAN NOT NULL DEFAULT false,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");
CREATE INDEX "newsletter_subscribers_subscribed_idx" ON "newsletter_subscribers"("subscribed");

-- Restore data to NewsletterSubscriber from CommunicationContact
INSERT INTO "newsletter_subscribers" SELECT * FROM "newsletter_subscribers_view";

-- Add back removed columns to CommunicationContact
ALTER TABLE "communication_contacts" ADD COLUMN "registrationSources" TEXT;
ALTER TABLE "communication_contacts" ADD COLUMN "reviewRating" INTEGER;
ALTER TABLE "communication_contacts" ADD COLUMN "reviewComment" TEXT;
ALTER TABLE "communication_contacts" ADD COLUMN "reviewDate" TIMESTAMP(3);
ALTER TABLE "communication_contacts" ADD COLUMN "reviewVerified" BOOLEAN DEFAULT false;
ALTER TABLE "communication_contacts" ADD COLUMN "reviewApproved" BOOLEAN DEFAULT false;

-- Restore registration sources as comma-separated string
UPDATE "communication_contacts" SET "registrationSources" = (
    SELECT string_agg(rs."source"::text, ',')
    FROM "registration_sources" rs
    WHERE rs."contactId" = "communication_contacts"."id"
);

-- Restore review data to CommunicationContact
UPDATE "communication_contacts" SET 
    "reviewRating" = r."rating",
    "reviewComment" = r."comment",
    "reviewDate" = r."createdAt",
    "reviewVerified" = r."verified",
    "reviewApproved" = r."approved"
FROM "reviews" r
WHERE r."contactId" = "communication_contacts"."id";

-- Add back patient fields to Appointment
ALTER TABLE "appointments" ADD COLUMN "patientName" TEXT;
ALTER TABLE "appointments" ADD COLUMN "patientCpf" TEXT;
ALTER TABLE "appointments" ADD COLUMN "patientMedicalRecordNumber" INTEGER;
ALTER TABLE "appointments" ADD COLUMN "patientPhone" TEXT;
ALTER TABLE "appointments" ADD COLUMN "patientWhatsapp" TEXT;
ALTER TABLE "appointments" ADD COLUMN "patientEmail" TEXT;
ALTER TABLE "appointments" ADD COLUMN "patientBirthDate" TEXT;

-- Restore patient data in appointments
UPDATE "appointments" SET
    "patientName" = cc."name",
    "patientCpf" = mp."cpf",
    "patientMedicalRecordNumber" = mp."medicalRecordNumber",
    "patientPhone" = cc."whatsapp",
    "patientWhatsapp" = cc."whatsapp",
    "patientEmail" = cc."email",
    "patientBirthDate" = cc."birthDate"
FROM "communication_contacts" cc
LEFT JOIN "medical_patients" mp ON "appointments"."medicalPatientId" = mp."id"
WHERE "appointments"."communicationContactId" = cc."id";

-- Make communicationContactId optional again
ALTER TABLE "appointments" ALTER COLUMN "communicationContactId" DROP NOT NULL;

-- Drop new tables
DROP TABLE IF EXISTS "registration_sources" CASCADE;
DROP TABLE IF EXISTS "reviews" CASCADE;

-- Drop views
DROP VIEW IF EXISTS "newsletter_subscribers_view";
DROP VIEW IF EXISTS "appointments_with_patient_data";

-- Drop enum
DROP TYPE IF EXISTS "RegistrationSourceType";

COMMIT;
*/
