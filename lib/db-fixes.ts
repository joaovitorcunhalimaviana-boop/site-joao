import { PrismaClient } from "@prisma/client";

// Ensures communication_contacts.phone column and index exist across providers
export async function ensureCommunicationContactsPhoneColumn(prisma: PrismaClient) {
  try {
    const dbUrl = process.env.DATABASE_URL || "";

    const isSqlite = dbUrl.startsWith("file:") || dbUrl.includes("sqlite");
    const isPostgres = dbUrl.startsWith("postgres") || dbUrl.includes("amazonaws.com") || dbUrl.includes(":5432");

    let hasPhoneColumn = false;

    if (isSqlite) {
      const columns: Array<{ name: string } & Record<string, any>> = await prisma.$queryRawUnsafe(
        `PRAGMA table_info('communication_contacts');`
      );
      hasPhoneColumn = Array.isArray(columns) && columns.some((c) => (c.name || c[1]) === "phone");
      if (!hasPhoneColumn) {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE communication_contacts ADD COLUMN phone TEXT;`
        );
      }
      // SQLite does not enforce index existence strongly; create if column exists now
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS communication_contacts_phone_idx ON communication_contacts(phone);`
      );
    } else if (isPostgres) {
      const exists: Array<{ exists: boolean }> = await prisma.$queryRawUnsafe(
        `SELECT EXISTS (
           SELECT 1
           FROM information_schema.columns
           WHERE table_schema = 'public'
             AND table_name = 'communication_contacts'
             AND column_name = 'phone'
         ) as exists;`
      );
      hasPhoneColumn = !!exists?.[0]?.exists;
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "communication_contacts" ADD COLUMN IF NOT EXISTS "phone" TEXT;`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "communication_contacts_phone_idx" ON "communication_contacts"("phone");`
      );
    } else {
      // Generic fallback: attempt safe add with IF NOT EXISTS, may be ignored by some providers
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE communication_contacts ADD COLUMN IF NOT EXISTS phone TEXT;`
        );
      } catch {}
      try {
        await prisma.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS communication_contacts_phone_idx ON communication_contacts(phone);`
        );
      } catch {}
    }
  } catch (err) {
    // Swallow errors to avoid breaking app startup; log minimal info
    console.error("DB Fixes: Failed to ensure communication_contacts.phone column", err);
  }
}