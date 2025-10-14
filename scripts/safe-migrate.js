// Safe migrate runner: attempts Prisma migrate deploy but never blocks app start
const { execSync } = require('child_process')

function log(msg) {
  console.log(`[safe-migrate] ${msg}`)
}

try {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    log('DATABASE_URL não definida. Pulando prisma migrate deploy.')
  } else {
    log('Executando prisma migrate deploy...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    log('Migrations aplicadas com sucesso.')
  }
} catch (err) {
  log(`Falha ao aplicar migrations: ${err?.message || err}`)
  log('Prosseguindo com o start da aplicação para não quebrar o healthcheck.')
}