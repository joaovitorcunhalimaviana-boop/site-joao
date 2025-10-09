import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 返回网站的主题颜色配置
    const themeColors = {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      navy: {
        700: '#1e3a8a',
        800: '#1e40af',
      },
      background: {
        primary: '#000000',
        secondary: '#0f172a',
        card: '#1e293b',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e2e8f0',
        muted: '#94a3b8',
      },
      accent: {
        blue: '#3b82f6',
        'blue-light': '#60a5fa',
      },
    }

    return NextResponse.json({
      success: true,
      colors: themeColors,
    })
  } catch (error) {
    console.error('Erro ao buscar cores do tema:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
