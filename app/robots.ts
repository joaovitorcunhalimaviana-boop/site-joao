import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] || 'https://drjoaovitorviana.com.br'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/area-medica/',
          '/area-secretaria/',
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/temp/',
          '*.pdf$',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/hemorroidas',
          '/fissura-anal',
          '/fistula-anal',
          '/cancer-colorretal',
          '/cisto-pilonidal',
          '/plicoma',
          '/especialidades',
          '/agendamento',
          '/contato',
          '/teleconsulta',
          '/avaliacoes',
        ],
        disallow: ['/area-medica/', '/area-secretaria/', '/admin/', '/api/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/area-medica/', '/area-secretaria/', '/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
