-- AlterTable Appointment: Rename and add fields
ALTER TABLE "appointments" RENAME COLUMN "date" TO "appointmentDate";
ALTER TABLE "appointments" RENAME COLUMN "time" TO "appointmentTime";

-- Add new optional fields
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "specialty" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "doctorName" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "reason" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "observations" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "confirmationSent" BOOLEAN NOT NULL DEFAULT false;

-- Update appointmentDate type if needed (assuming it was DateTime before)
-- This converts DateTime to String (YYYY-MM-DD format)
ALTER TABLE "appointments" ALTER COLUMN "appointmentDate" TYPE TEXT USING TO_CHAR("appointmentDate"::timestamp, 'YYYY-MM-DD');
