/*
  Warnings:

  - You are about to drop the column `pacienteId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the `Consulta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Paciente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `patientId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_pacienteId_fkey";

-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "pacienteId",
ADD COLUMN     "patientId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Consulta";

-- DropTable
DROP TABLE "public"."Paciente";

-- DropTable
DROP TABLE "public"."Usuario";

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
