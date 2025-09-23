import { NextResponse } from 'next/server'
import { initializeBirthdayScheduler } from '@/lib/birthday-scheduler'

export async function POST() {
  try {
    await initializeBirthdayScheduler()

    return NextResponse.json({
      success: true,
      message: 'Birthday scheduler initialized successfully',
    })
  } catch (error) {
    console.error('Failed to initialize birthday scheduler:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize birthday scheduler',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
