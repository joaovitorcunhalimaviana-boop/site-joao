/*
  Warnings:

  - You are about to drop the column `appointmentType` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientBirthDate` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientCpf` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientEmail` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientMedicalRecordNumber` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientName` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientPhone` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `patientWhatsapp` on the `appointments` table. All the data in the column will be lost.
  - The `source` column on the `appointments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `patientId` on the `calculator_results` table. All the data in the column will be lost.
  - You are about to drop the column `registrationSources` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `reviewApproved` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `reviewComment` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `reviewDate` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `reviewRating` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `reviewVerified` on the `communication_contacts` table. All the data in the column will be lost.
  - You are about to drop the column `assessment` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `chiefComplaint` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `history` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `physicalExam` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `consultations` table. All the data in the column will be lost.
  - You are about to drop the column `duplicatePatientId` on the `duplicate_detections` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `duplicate_detections` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `medical_attachments` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `patientName` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the `AuditLogMedico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Avaliacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HorarioDisponivel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NewsletterSubscriberMedico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `newsletter_subscribers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `patients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactId` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('MANUAL', 'ONLINE', 'PHONE', 'WHATSAPP', 'SYSTEM');

-- CreateEnum
CREATE TYPE "RegistrationSourceType" AS ENUM ('NEWSLETTER', 'PUBLIC_APPOINTMENT', 'DOCTOR_AREA', 'SECRETARY_AREA', 'REVIEW', 'MEDICAL_AREA', 'PUBLIC_SCHEDULING', 'WHATSAPP', 'PHONE', 'REFERRAL');

-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_communicationContactId_fkey";

-- DropForeignKey
ALTER TABLE "public"."appointments" DROP CONSTRAINT "appointments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."calculator_results" DROP CONSTRAINT "calculator_results_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."consultations" DROP CONSTRAINT "consultations_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."duplicate_detections" DROP CONSTRAINT "duplicate_detections_duplicatePatientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."duplicate_detections" DROP CONSTRAINT "duplicate_detections_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medical_attachments" DROP CONSTRAINT "medical_attachments_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."medical_records" DROP CONSTRAINT "medical_records_patientId_fkey";

-- DropIndex
DROP INDEX "public"."appointments_patientId_idx";

-- DropIndex
DROP INDEX "public"."calculator_results_patientId_idx";

-- DropIndex
DROP INDEX "public"."consultations_patientId_idx";

-- DropIndex
DROP INDEX "public"."duplicate_detections_duplicatePatientId_idx";

-- DropIndex
DROP INDEX "public"."duplicate_detections_patientId_idx";

-- DropIndex
DROP INDEX "public"."medical_attachments_patientId_idx";

-- DropIndex
DROP INDEX "public"."medical_records_patientId_idx";

-- DropIndex
DROP INDEX "public"."reviews_published_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "appointmentType",
DROP COLUMN "patientBirthDate",
DROP COLUMN "patientCpf",
DROP COLUMN "patientEmail",
DROP COLUMN "patientId",
DROP COLUMN "patientMedicalRecordNumber",
DROP COLUMN "patientName",
DROP COLUMN "patientPhone",
DROP COLUMN "patientWhatsapp",
ADD COLUMN     "doctorName" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'CONSULTATION',
ALTER COLUMN "communicationContactId" DROP NOT NULL,
DROP COLUMN "source",
ADD COLUMN     "source" "AppointmentSource" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "calculator_results" DROP COLUMN "patientId";

-- AlterTable
ALTER TABLE "communication_contacts" DROP COLUMN "registrationSources",
DROP COLUMN "reviewApproved",
DROP COLUMN "reviewComment",
DROP COLUMN "reviewDate",
DROP COLUMN "reviewRating",
DROP COLUMN "reviewVerified",
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "consultations" DROP COLUMN "assessment",
DROP COLUMN "chiefComplaint",
DROP COLUMN "history",
DROP COLUMN "patientId",
DROP COLUMN "physicalExam",
DROP COLUMN "plan",
ADD COLUMN     "anamnese" TEXT;

-- AlterTable
ALTER TABLE "duplicate_detections" DROP COLUMN "duplicatePatientId",
DROP COLUMN "patientId";

-- AlterTable
ALTER TABLE "medical_attachments" DROP COLUMN "patientId";

-- AlterTable
ALTER TABLE "medical_records" DROP COLUMN "patientId";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "patientName",
DROP COLUMN "published",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ALTER COLUMN "category" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."AuditLogMedico";

-- DropTable
DROP TABLE "public"."Avaliacao";

-- DropTable
DROP TABLE "public"."HorarioDisponivel";

-- DropTable
DROP TABLE "public"."NewsletterSubscriberMedico";

-- DropTable
DROP TABLE "public"."newsletter_subscribers";

-- DropTable
DROP TABLE "public"."patients";

-- DropEnum
DROP TYPE "public"."RegistrationSource";

-- CreateTable
CREATE TABLE "registration_sources" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "source" "RegistrationSourceType" NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableTimeSlot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "consultationId" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvailableTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registration_sources_contactId_idx" ON "registration_sources"("contactId");

-- CreateIndex
CREATE INDEX "registration_sources_source_idx" ON "registration_sources"("source");

-- CreateIndex
CREATE INDEX "registration_sources_createdAt_idx" ON "registration_sources"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AvailableTimeSlot_consultationId_key" ON "AvailableTimeSlot"("consultationId");

-- CreateIndex
CREATE INDEX "AvailableTimeSlot_date_available_idx" ON "AvailableTimeSlot"("date", "available");

-- CreateIndex
CREATE UNIQUE INDEX "AvailableTimeSlot_date_startTime_key" ON "AvailableTimeSlot"("date", "startTime");

-- CreateIndex
CREATE INDEX "appointments_source_idx" ON "appointments"("source");

-- CreateIndex
CREATE INDEX "appointments_type_idx" ON "appointments"("type");

-- CreateIndex
CREATE INDEX "communication_contacts_phone_idx" ON "communication_contacts"("phone");

-- CreateIndex
CREATE INDEX "reviews_contactId_idx" ON "reviews"("contactId");

-- CreateIndex
CREATE INDEX "reviews_approved_idx" ON "reviews"("approved");

-- CreateIndex
CREATE INDEX "reviews_verified_idx" ON "reviews"("verified");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_communicationContactId_fkey" FOREIGN KEY ("communicationContactId") REFERENCES "communication_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_sources" ADD CONSTRAINT "registration_sources_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "communication_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "communication_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
