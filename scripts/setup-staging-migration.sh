#!/bin/bash

################################################################################
# STAGING MIGRATION SETUP SCRIPT
################################################################################
# This script creates a safe staging environment for testing database migration
#
# Features:
# - Creates a copy of production database
# - Sets up test environment variables
# - Generates test data if database is empty
# - Validates schema before migration
# - Creates rollback points
#
# Usage: ./scripts/setup-staging-migration.sh
################################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Script start
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         STAGING MIGRATION SETUP - DATABASE MIGRATION         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Detect database type and location
log_info "Step 1: Detecting database configuration..."

if [ ! -f ".env" ]; then
    log_error ".env file not found!"
    log_info "Creating .env from .env.example if available..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_success "Created .env from .env.example"
    else
        log_error "No .env.example found. Please create .env manually."
        exit 1
    fi
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    log_error "DATABASE_URL not set in .env file!"
    exit 1
fi

log_success "Database URL detected: ${DATABASE_URL}"

# Detect database type
if [[ "$DATABASE_URL" == *"postgresql"* ]] || [[ "$DATABASE_URL" == *"postgres"* ]]; then
    DB_TYPE="postgres"
    log_info "Database type: PostgreSQL"
elif [[ "$DATABASE_URL" == *"sqlite"* ]] || [[ "$DATABASE_URL" == file:* ]]; then
    DB_TYPE="sqlite"
    log_info "Database type: SQLite"
else
    log_error "Unsupported database type. Only PostgreSQL and SQLite are supported."
    exit 1
fi

# Step 2: Create backup of production database
log_info "Step 2: Creating backup of production database..."

BACKUP_DIR="backups/staging"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/production_backup_${TIMESTAMP}"

mkdir -p "$BACKUP_DIR"

if [ "$DB_TYPE" == "sqlite" ]; then
    # Extract SQLite database file path
    DB_FILE=$(echo $DATABASE_URL | sed 's/file://')

    if [ ! -f "$DB_FILE" ]; then
        log_error "Database file not found: $DB_FILE"
        exit 1
    fi

    log_info "Backing up SQLite database: $DB_FILE"
    cp "$DB_FILE" "${BACKUP_FILE}.db"
    log_success "Backup created: ${BACKUP_FILE}.db"

elif [ "$DB_TYPE" == "postgres" ]; then
    # PostgreSQL backup using pg_dump
    log_info "Backing up PostgreSQL database..."

    # Parse connection string
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -f "${BACKUP_FILE}.dump" "$DB_NAME"

    if [ $? -eq 0 ]; then
        log_success "Backup created: ${BACKUP_FILE}.dump"
    else
        log_error "Failed to create PostgreSQL backup"
        exit 1
    fi
fi

# Step 3: Create staging database
log_info "Step 3: Creating staging database..."

if [ "$DB_TYPE" == "sqlite" ]; then
    STAGING_DB="prisma/staging_database.db"

    # Copy production database to staging
    cp "$DB_FILE" "$STAGING_DB"
    log_success "Staging database created: $STAGING_DB"

    # Update environment for staging
    echo "" >> .env.staging
    echo "# Staging database configuration" >> .env.staging
    echo "DATABASE_URL=\"file:./staging_database.db\"" >> .env.staging

elif [ "$DB_TYPE" == "postgres" ]; then
    STAGING_DB_NAME="${DB_NAME}_staging"

    log_info "Creating staging database: $STAGING_DB_NAME"

    # Drop staging database if exists
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $STAGING_DB_NAME;" 2>/dev/null || true

    # Create staging database
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $STAGING_DB_NAME;"

    # Restore backup to staging database
    PGPASSWORD="$DB_PASS" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$STAGING_DB_NAME" "${BACKUP_FILE}.dump"

    if [ $? -eq 0 ]; then
        log_success "Staging database created and populated: $STAGING_DB_NAME"
    else
        log_error "Failed to create staging database"
        exit 1
    fi

    # Update environment for staging
    STAGING_DB_URL=$(echo $DATABASE_URL | sed "s/$DB_NAME/$STAGING_DB_NAME/")
    echo "" >> .env.staging
    echo "# Staging database configuration" >> .env.staging
    echo "DATABASE_URL=\"$STAGING_DB_URL\"" >> .env.staging
fi

log_success "Staging environment file created: .env.staging"

# Step 4: Validate schema before migration
log_info "Step 4: Validating schema before migration..."

# Run Prisma validation
log_info "Running Prisma schema validation..."
npx prisma validate

if [ $? -eq 0 ]; then
    log_success "Schema validation passed"
else
    log_error "Schema validation failed"
    exit 1
fi

# Check for pending migrations
log_info "Checking migration status..."
npx prisma migrate status

# Step 5: Generate test data if database is empty
log_info "Step 5: Checking if test data is needed..."

# Count records in key tables using Prisma
RECORD_COUNT=$(npx prisma db execute --stdin <<EOF
SELECT
  (SELECT COUNT(*) FROM communication_contacts) as contacts,
  (SELECT COUNT(*) FROM medical_patients) as patients,
  (SELECT COUNT(*) FROM appointments) as appointments
EOF
)

if [[ "$RECORD_COUNT" =~ "0" ]]; then
    log_warning "Database appears to be empty. Generating test data..."

    if [ -f "scripts/generate-test-data.ts" ]; then
        npx tsx scripts/generate-test-data.ts
        log_success "Test data generated successfully"
    else
        log_warning "Test data generator not found. Run: npm run generate-test-data"
    fi
else
    log_info "Database contains data. Skipping test data generation."
fi

# Step 6: Create pre-migration snapshot
log_info "Step 6: Creating pre-migration snapshot..."

SNAPSHOT_DIR="${BACKUP_DIR}/snapshots"
mkdir -p "$SNAPSHOT_DIR"

if [ "$DB_TYPE" == "sqlite" ]; then
    cp "$STAGING_DB" "${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.db"
    log_success "Pre-migration snapshot: ${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.db"
elif [ "$DB_TYPE" == "postgres" ]; then
    PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -F c -f "${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.dump" "$STAGING_DB_NAME"
    log_success "Pre-migration snapshot: ${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.dump"
fi

# Step 7: Generate validation baseline
log_info "Step 7: Generating validation baseline..."

VALIDATION_DIR="backups/staging/validation"
mkdir -p "$VALIDATION_DIR"

# Export current record counts and checksums
cat > "${VALIDATION_DIR}/baseline_${TIMESTAMP}.json" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "database_type": "$DB_TYPE",
  "backup_file": "${BACKUP_FILE}",
  "snapshot_file": "${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}",
  "validation_scripts": [
    "scripts/validate-migration-data.ts",
    "scripts/test-migration.ts"
  ],
  "rollback_script": "scripts/test-rollback.sh",
  "notes": "Baseline created before migration testing"
}
EOF

log_success "Validation baseline created: ${VALIDATION_DIR}/baseline_${TIMESTAMP}.json"

# Step 8: Create rollback script
log_info "Step 8: Creating rollback script..."

cat > "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh" <<'ROLLBACK_EOF'
#!/bin/bash
# AUTOMATIC ROLLBACK SCRIPT
# Generated: TIMESTAMP_PLACEHOLDER

set -e

echo "Starting rollback to pre-migration state..."

# Restore from snapshot
if [ "$DB_TYPE_PLACEHOLDER" == "sqlite" ]; then
    cp "SNAPSHOT_PATH_PLACEHOLDER" "STAGING_DB_PLACEHOLDER"
    echo "SQLite database restored from snapshot"
elif [ "$DB_TYPE_PLACEHOLDER" == "postgres" ]; then
    PGPASSWORD="$DB_PASS" dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$STAGING_DB_NAME"
    PGPASSWORD="$DB_PASS" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$STAGING_DB_NAME"
    PGPASSWORD="$DB_PASS" pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$STAGING_DB_NAME" "SNAPSHOT_PATH_PLACEHOLDER"
    echo "PostgreSQL database restored from snapshot"
fi

echo "Rollback completed successfully"
ROLLBACK_EOF

# Replace placeholders
sed -i "s|TIMESTAMP_PLACEHOLDER|$TIMESTAMP|g" "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
sed -i "s|DB_TYPE_PLACEHOLDER|$DB_TYPE|g" "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
sed -i "s|STAGING_DB_PLACEHOLDER|$STAGING_DB|g" "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh" 2>/dev/null || true

if [ "$DB_TYPE" == "sqlite" ]; then
    sed -i "s|SNAPSHOT_PATH_PLACEHOLDER|${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.db|g" "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
else
    sed -i "s|SNAPSHOT_PATH_PLACEHOLDER|${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}.dump|g" "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
fi

chmod +x "${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
log_success "Rollback script created: ${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"

# Final summary
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    SETUP COMPLETE                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
log_success "Staging environment is ready for migration testing!"
echo ""
echo "Summary:"
echo "  • Database Type: $DB_TYPE"
echo "  • Production Backup: ${BACKUP_FILE}"
echo "  • Staging Database: ${STAGING_DB:-$STAGING_DB_NAME}"
echo "  • Environment File: .env.staging"
echo "  • Pre-migration Snapshot: ${SNAPSHOT_DIR}/pre_migration_${TIMESTAMP}"
echo "  • Rollback Script: ${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
echo "  • Validation Baseline: ${VALIDATION_DIR}/baseline_${TIMESTAMP}.json"
echo ""
echo "Next Steps:"
echo "  1. Run validation: npx tsx scripts/validate-migration-data.ts"
echo "  2. Run migration test: npx tsx scripts/test-migration.ts"
echo "  3. If needed, rollback: bash ${BACKUP_DIR}/rollback_${TIMESTAMP}.sh"
echo ""
log_warning "IMPORTANT: Always test on staging before applying to production!"
echo ""
