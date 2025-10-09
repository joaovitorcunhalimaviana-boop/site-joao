# API Implementation Guide - New Architecture

This guide shows how to update existing API routes to use the new Prisma-based architecture instead of JSON file storage.

## Table of Contents
1. [Newsletter API Updates](#newsletter-api-updates)
2. [Public Appointment API Updates](#public-appointment-api-updates)
3. [Reviews API Updates](#reviews-api-updates)
4. [Communication Contact API Updates](#communication-contact-api-updates)
5. [Medical Patient API Updates](#medical-patient-api-updates)
6. [Query Patterns](#query-patterns)

---

## Newsletter API Updates

### Before (JSON file storage)
```typescript
// OLD: lib/unified-patient-system.ts
export function getAllCommunicationContacts(): CommunicationContact[] {
  return loadFromStorage<CommunicationContact>(COMMUNICATION_CONTACTS_FILE)
}
```

### After (Prisma)
```typescript
// NEW: Use Prisma client
import { prisma } from '@/lib/prisma'

// Get all newsletter subscribers
export async function getNewsletterSubscribers() {
  return await prisma.communicationContact.findMany({
    where: {
      emailNewsletter: true,
      emailSubscribed: true,
    },
    include: {
      registrationSources: {
        select: {
          source: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      emailSubscribedAt: 'desc',
    },
  })
}

// Subscribe to newsletter
export async function subscribeToNewsletter(data: {
  name: string
  email: string
  whatsapp?: string
  birthDate?: string
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create or update contact
    const contact = await tx.communicationContact.upsert({
      where: { email: data.email },
      create: {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
        birthDate: data.birthDate,
        emailNewsletter: true,
        emailSubscribed: true,
        emailSubscribedAt: new Date(),
        emailHealthTips: true,
        emailAppointments: true,
      },
      update: {
        emailNewsletter: true,
        emailSubscribed: true,
        emailSubscribedAt: new Date(),
      },
    })

    // 2. Add registration source
    await tx.registrationSource.create({
      data: {
        contactId: contact.id,
        source: 'NEWSLETTER',
      },
    })

    return contact
  })
}
```

### Updated API Route: `/api/newsletter/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'subscribers') {
      const subscribers = await prisma.communicationContact.findMany({
        where: {
          emailNewsletter: true,
          emailSubscribed: true,
        },
        include: {
          registrationSources: true,
        },
      })

      return NextResponse.json({
        success: true,
        subscribers,
        total: subscribers.length,
      })
    }

    // Stats
    const totalSubscribers = await prisma.communicationContact.count({
      where: {
        emailNewsletter: true,
        emailSubscribed: true,
      },
    })

    const recentSubscribers = await prisma.communicationContact.findMany({
      where: {
        emailNewsletter: true,
        emailSubscribed: true,
      },
      orderBy: {
        emailSubscribedAt: 'desc',
      },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalSubscribers,
        recentSubscribers,
      },
    })
  } catch (error) {
    console.error('Newsletter API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, name, whatsapp, birthDate } = body

    if (action === 'subscribe') {
      // Check if already subscribed
      const existing = await prisma.communicationContact.findUnique({
        where: { email },
      })

      if (existing?.emailSubscribed && existing?.emailNewsletter) {
        return NextResponse.json(
          { success: false, message: 'Already subscribed' },
          { status: 409 }
        )
      }

      // Subscribe
      const contact = await prisma.$transaction(async (tx) => {
        const contact = await tx.communicationContact.upsert({
          where: { email },
          create: {
            name,
            email,
            whatsapp,
            birthDate,
            emailNewsletter: true,
            emailSubscribed: true,
            emailSubscribedAt: new Date(),
            emailHealthTips: true,
            emailAppointments: true,
          },
          update: {
            emailNewsletter: true,
            emailSubscribed: true,
            emailSubscribedAt: new Date(),
          },
        })

        await tx.registrationSource.create({
          data: {
            contactId: contact.id,
            source: 'NEWSLETTER',
          },
        })

        return contact
      })

      // Send Telegram notification
      await sendTelegramNewsletterNotification({
        name: contact.name,
        email: contact.email!,
        whatsapp: contact.whatsapp,
        birthDate: contact.birthDate,
      })

      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed!',
        contactId: contact.id,
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Public Appointment API Updates

### Updated API Route: `/api/public-appointment/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateCPF } from '@/lib/validation-schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      cpf,
      email,
      phone,
      whatsapp,
      birthDate,
      insuranceType,
      selectedDate,
      selectedTime,
    } = body

    // Validation
    if (!fullName || !cpf || !whatsapp || !selectedDate || !selectedTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cpfClean = cpf.replace(/\D/g, '')
    if (!validateCPF(cpfClean)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CPF' },
        { status: 400 }
      )
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Check if medical patient exists
      let medicalPatient = await tx.medicalPatient.findUnique({
        where: { cpf: cpfClean },
        include: {
          communicationContact: true,
        },
      })

      let communicationContact: any

      if (medicalPatient) {
        // Patient exists - use existing records
        communicationContact = medicalPatient.communicationContact
      } else {
        // New patient - create both contact and medical patient

        // 1a. Create or update communication contact
        communicationContact = await tx.communicationContact.upsert({
          where: { email: email || `${whatsapp}@temp.local` },
          create: {
            name: fullName,
            email: email,
            whatsapp: whatsapp,
            birthDate: birthDate,
            emailAppointments: true,
            whatsappAppointments: true,
            whatsappReminders: true,
          },
          update: {
            name: fullName,
            whatsapp: whatsapp,
            birthDate: birthDate,
          },
        })

        // 1b. Add registration source
        await tx.registrationSource.create({
          data: {
            contactId: communicationContact.id,
            source: 'PUBLIC_APPOINTMENT',
          },
        })

        // 1c. Get next medical record number
        const lastPatient = await tx.medicalPatient.findFirst({
          orderBy: { medicalRecordNumber: 'desc' },
        })
        const nextRecordNumber = (lastPatient?.medicalRecordNumber || 0) + 1

        // 1d. Create medical patient
        medicalPatient = await tx.medicalPatient.create({
          data: {
            communicationContactId: communicationContact.id,
            cpf: cpfClean,
            medicalRecordNumber: nextRecordNumber,
            fullName: fullName,
            insuranceType: insuranceType || 'PARTICULAR',
            consentDataProcessing: true,
            consentDataProcessingDate: new Date(),
            consentMedicalTreatment: true,
            consentMedicalTreatmentDate: new Date(),
          },
        })
      }

      // 2. Create appointment
      const appointment = await tx.appointment.create({
        data: {
          communicationContactId: communicationContact.id,
          medicalPatientId: medicalPatient.id,
          date: new Date(selectedDate),
          time: selectedTime,
          type: 'CONSULTATION',
          status: 'SCHEDULED',
          source: 'ONLINE',
          insuranceType: insuranceType || 'PARTICULAR',
        },
        include: {
          communicationContact: true,
          medicalPatient: true,
        },
      })

      return {
        appointment,
        patient: medicalPatient,
        contact: communicationContact,
        isNewPatient: !medicalPatient,
      }
    })

    // Send Telegram notification
    await sendTelegramAppointmentNotification({
      patientName: result.contact.name,
      patientEmail: result.contact.email,
      patientPhone: result.contact.whatsapp,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      insuranceType: insuranceType,
    })

    return NextResponse.json({
      success: true,
      appointment: result.appointment,
      message: 'Appointment created successfully!',
    })
  } catch (error) {
    console.error('Public appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Reviews API Updates

### Updated API Route: `/api/reviews/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const approved = searchParams.get('approved')
    const rating = searchParams.get('rating')

    const where: any = {}

    if (approved === 'true') {
      where.approved = true
    } else if (approved === 'false') {
      where.approved = false
    }

    if (rating) {
      where.rating = parseInt(rating)
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        contact: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = await prisma.review.aggregate({
      where: { approved: true },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    })

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { approved: true },
      _count: true,
    })

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews: stats._count.id,
        averageRating: stats._avg.rating || 0,
        ratingDistribution: Object.fromEntries(
          ratingDistribution.map(r => [r.rating, r._count])
        ),
      },
    })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { patientName, email, phone, rating, comment } = body

    // Validation
    if (!patientName || !email || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already reviewed
    const existingContact = await prisma.communicationContact.findUnique({
      where: { email },
      include: {
        reviews: true,
      },
    })

    if (existingContact?.reviews.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a review' },
        { status: 400 }
      )
    }

    // Create review with contact in transaction
    const review = await prisma.$transaction(async (tx) => {
      // Create or update contact
      const contact = await tx.communicationContact.upsert({
        where: { email },
        create: {
          name: patientName,
          email: email,
          whatsapp: phone,
        },
        update: {
          name: patientName,
          whatsapp: phone,
        },
      })

      // Add registration source
      await tx.registrationSource.create({
        data: {
          contactId: contact.id,
          source: 'REVIEW',
        },
      })

      // Create review
      return await tx.review.create({
        data: {
          contactId: contact.id,
          rating: parseInt(rating),
          comment: comment.trim(),
          approved: true, // Auto-approve or set to false for moderation
        },
        include: {
          contact: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })
    })

    // Send Telegram notification
    await sendTelegramReviewNotification(review)

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Communication Contact API Updates

### Updated API Route: `/api/unified-system/communication/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const source = searchParams.get('source')
    const subscribed = searchParams.get('subscribed')

    if (id) {
      const contact = await prisma.communicationContact.findUnique({
        where: { id },
        include: {
          registrationSources: true,
          reviews: true,
          medicalPatients: true,
          appointments: {
            orderBy: { date: 'desc' },
            take: 5,
          },
        },
      })

      if (!contact) {
        return NextResponse.json(
          { success: false, message: 'Contact not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        contact,
      })
    }

    if (email) {
      const contact = await prisma.communicationContact.findUnique({
        where: { email },
        include: {
          registrationSources: true,
          reviews: true,
          medicalPatients: true,
        },
      })

      if (!contact) {
        return NextResponse.json(
          { success: false, message: 'Contact not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        contact,
      })
    }

    // List all contacts with filters
    const where: any = {}

    if (source) {
      where.registrationSources = {
        some: {
          source: source,
        },
      }
    }

    if (subscribed !== null) {
      where.emailSubscribed = subscribed === 'true'
    }

    const contacts = await prisma.communicationContact.findMany({
      where,
      include: {
        registrationSources: true,
        _count: {
          select: {
            reviews: true,
            appointments: true,
            medicalPatients: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = {
      total: contacts.length,
      withEmail: contacts.filter(c => c.email).length,
      withWhatsapp: contacts.filter(c => c.whatsapp).length,
      newsletterSubscribers: contacts.filter(c => c.emailNewsletter).length,
      whatsappSubscribers: contacts.filter(c => c.whatsappSubscribed).length,
    }

    return NextResponse.json({
      success: true,
      contacts,
      stats,
    })
  } catch (error) {
    console.error('Communication contact API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, emailPreferences, whatsappPreferences } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Contact ID required' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (emailPreferences) {
      Object.assign(updateData, {
        emailSubscribed: emailPreferences.subscribed,
        emailNewsletter: emailPreferences.newsletter,
        emailHealthTips: emailPreferences.healthTips,
        emailAppointments: emailPreferences.appointments,
        emailPromotions: emailPreferences.promotions,
      })

      // Update subscription timestamps
      if (emailPreferences.subscribed === false) {
        updateData.emailUnsubscribedAt = new Date()
      } else if (emailPreferences.subscribed === true) {
        updateData.emailSubscribedAt = new Date()
        updateData.emailUnsubscribedAt = null
      }
    }

    if (whatsappPreferences) {
      Object.assign(updateData, {
        whatsappSubscribed: whatsappPreferences.subscribed,
        whatsappAppointments: whatsappPreferences.appointments,
        whatsappReminders: whatsappPreferences.reminders,
        whatsappPromotions: whatsappPreferences.promotions,
      })

      if (whatsappPreferences.subscribed === true) {
        updateData.whatsappSubscribedAt = new Date()
      }
    }

    const contact = await prisma.communicationContact.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      contact,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    console.error('Update preferences error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Query Patterns

### Newsletter Queries
```typescript
// Get all newsletter subscribers with sources
const newsletterSubscribers = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
  },
  include: {
    registrationSources: {
      select: {
        source: true,
        createdAt: true,
      },
    },
  },
})

// Get subscribers from specific source
const publicAppointmentSubscribers = await prisma.communicationContact.findMany({
  where: {
    emailNewsletter: true,
    emailSubscribed: true,
    registrationSources: {
      some: {
        source: 'PUBLIC_APPOINTMENT',
      },
    },
  },
})

// Get subscribers for health tips
const healthTipsSubscribers = await prisma.communicationContact.findMany({
  where: {
    emailSubscribed: true,
    emailHealthTips: true,
  },
  select: {
    name: true,
    email: true,
    birthDate: true,
  },
})
```

### WhatsApp Queries
```typescript
// Get contacts for appointment reminders
const reminderContacts = await prisma.communicationContact.findMany({
  where: {
    whatsappSubscribed: true,
    whatsappReminders: true,
    whatsapp: {
      not: null,
    },
  },
  select: {
    id: true,
    name: true,
    whatsapp: true,
  },
})

// Get today's appointments for WhatsApp confirmation
const today = new Date()
today.setHours(0, 0, 0, 0)

const appointmentsForConfirmation = await prisma.appointment.findMany({
  where: {
    date: today,
    status: 'SCHEDULED',
    communicationContact: {
      whatsappSubscribed: true,
      whatsappAppointments: true,
    },
  },
  include: {
    communicationContact: {
      select: {
        name: true,
        whatsapp: true,
      },
    },
    medicalPatient: {
      select: {
        medicalRecordNumber: true,
      },
    },
  },
})
```

### Medical Patient Queries
```typescript
// Get medical patient with all related data
const patientData = await prisma.medicalPatient.findUnique({
  where: { cpf: cpf },
  include: {
    communicationContact: {
      include: {
        registrationSources: true,
      },
    },
    appointments: {
      orderBy: { date: 'desc' },
      take: 10,
    },
    consultations: {
      orderBy: { startTime: 'desc' },
      take: 5,
      include: {
        medicalRecords: true,
        prescriptions: true,
      },
    },
    calculatorResults: {
      orderBy: { calculatedAt: 'desc' },
      take: 5,
    },
  },
})

// Check if contact is also a medical patient
const contactWithPatientStatus = await prisma.communicationContact.findUnique({
  where: { email: email },
  include: {
    medicalPatients: {
      select: {
        id: true,
        cpf: true,
        medicalRecordNumber: true,
        isActive: true,
      },
    },
  },
})

const isMedicalPatient = contactWithPatientStatus?.medicalPatients.length > 0
```

### Review Queries
```typescript
// Get approved reviews for public display
const publicReviews = await prisma.review.findMany({
  where: {
    approved: true,
  },
  include: {
    contact: {
      select: {
        name: true,
      },
    },
  },
  orderBy: {
    createdAt: 'desc',
  },
})

// Get review statistics
const reviewStats = await prisma.review.aggregate({
  where: {
    approved: true,
  },
  _avg: {
    rating: true,
  },
  _count: {
    id: true,
  },
})

const ratingBreakdown = await prisma.review.groupBy({
  by: ['rating'],
  where: {
    approved: true,
  },
  _count: {
    rating: true,
  },
})
```

---

## Migration Checklist

### Phase 1: Preparation
- [ ] Backup current database
- [ ] Run migration script on development database
- [ ] Test all API endpoints with new Prisma queries
- [ ] Verify data integrity

### Phase 2: Code Updates
- [ ] Update `/api/newsletter/route.ts`
- [ ] Update `/api/public-appointment/route.ts`
- [ ] Update `/api/reviews/route.ts`
- [ ] Update `/api/unified-system/communication/route.ts`
- [ ] Update `/api/unified-system/medical-patients/[id]/route.ts`
- [ ] Remove JSON file dependencies from `lib/unified-patient-system.ts`

### Phase 3: Testing
- [ ] Test newsletter subscription flow
- [ ] Test public appointment creation
- [ ] Test review submission
- [ ] Test communication preferences update
- [ ] Test medical patient creation
- [ ] Verify WhatsApp/email notifications still work

### Phase 4: Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Have rollback plan ready

---

## Benefits Summary

1. **Database Integrity**: Foreign key constraints ensure data consistency
2. **Better Performance**: Indexed queries are faster than JSON file parsing
3. **Atomic Operations**: Transactions ensure data is never in inconsistent state
4. **Scalability**: Database can handle millions of records efficiently
5. **Type Safety**: Prisma provides full TypeScript type safety
6. **Query Optimization**: Database query planner optimizes complex queries
7. **Data Validation**: Database-level validation prevents invalid data
8. **Backup & Recovery**: Standard database backup tools work out of the box
