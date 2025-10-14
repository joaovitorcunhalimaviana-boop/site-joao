import { PrismaClient } from '@prisma/client'
import { ensureCommunicationContactsPhoneColumn } from './db-fixes'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

// Executa correções de esquema de forma assíncrona para evitar erros P2022
void (async () => {
  try {
    await ensureCommunicationContactsPhoneColumn(prisma)
  } catch (e) {
    console.error('Prisma bootstrap: comunicação phone ensure falhou', e)
  }
})()