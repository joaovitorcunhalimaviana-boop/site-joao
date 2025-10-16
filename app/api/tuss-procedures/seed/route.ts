import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthManager } from '@/lib/auth';

const commonProcedures = [
  // Procedimentos Orificiais
  {
    tussCode: '31001017',
    cbhpmCode: '3.10.01.17-0',
    description: 'Hemorroidectomia',
    category: 'ORIFICIAL' as const,
    unitValue: 1200.00
  },
  {
    tussCode: '31001025',
    cbhpmCode: '3.10.01.25-1',
    description: 'Fistulotomia anal',
    category: 'ORIFICIAL' as const,
    unitValue: 800.00
  },
  {
    tussCode: '31001033',
    cbhpmCode: '3.10.01.33-2',
    description: 'Fistulectomia anal',
    category: 'ORIFICIAL' as const,
    unitValue: 1000.00
  },
  {
    tussCode: '31001041',
    cbhpmCode: '3.10.01.41-3',
    description: 'Esfincterotomia anal',
    category: 'ORIFICIAL' as const,
    unitValue: 600.00
  },
  {
    tussCode: '31001050',
    cbhpmCode: '3.10.01.50-2',
    description: 'Ressecção de condiloma acuminado perianal',
    category: 'ORIFICIAL' as const,
    unitValue: 700.00
  },
  {
    tussCode: '31001068',
    cbhpmCode: '3.10.01.68-5',
    description: 'Drenagem de abscesso perianal',
    category: 'ORIFICIAL' as const,
    unitValue: 500.00
  },
  {
    tussCode: '31001076',
    cbhpmCode: '3.10.01.76-6',
    description: 'Excisão de cisto pilonidal',
    category: 'PILONIDAL' as const,
    unitValue: 900.00
  },
  
  // Procedimentos de Colectomia
  {
    tussCode: '31002012',
    cbhpmCode: '3.10.02.12-9',
    description: 'Colectomia direita',
    category: 'COLECTOMY' as const,
    unitValue: 3500.00
  },
  {
    tussCode: '31002020',
    cbhpmCode: '3.10.02.20-0',
    description: 'Colectomia esquerda',
    category: 'COLECTOMY' as const,
    unitValue: 3500.00
  },
  {
    tussCode: '31002039',
    cbhpmCode: '3.10.02.39-0',
    description: 'Sigmoidectomia',
    category: 'COLECTOMY' as const,
    unitValue: 3000.00
  },
  {
    tussCode: '31002047',
    cbhpmCode: '3.10.02.47-1',
    description: 'Retossigmoidectomia',
    category: 'COLECTOMY' as const,
    unitValue: 4000.00
  },
  {
    tussCode: '31002055',
    cbhpmCode: '3.10.02.55-2',
    description: 'Colectomia total',
    category: 'COLECTOMY' as const,
    unitValue: 5000.00
  },
  
  // Outros Procedimentos
  {
    tussCode: '31003018',
    cbhpmCode: '3.10.03.18-7',
    description: 'Colonoscopia diagnóstica',
    category: 'OTHER' as const,
    unitValue: 400.00
  },
  {
    tussCode: '31003026',
    cbhpmCode: '3.10.03.26-8',
    description: 'Polipectomia colonoscópica',
    category: 'OTHER' as const,
    unitValue: 800.00
  },
  {
    tussCode: '31003034',
    cbhpmCode: '3.10.03.34-9',
    description: 'Retossigmoidoscopia',
    category: 'OTHER' as const,
    unitValue: 200.00
  },
  {
    tussCode: '31003042',
    cbhpmCode: '3.10.03.42-0',
    description: 'Anuscopia',
    category: 'OTHER' as const,
    unitValue: 150.00
  }
];

// POST - Popular banco com procedimentos TUSS/CBHPM
export async function POST(request: NextRequest) {
  try {
    const user = AuthManager.authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se já existem procedimentos
    const existingCount = await prisma.tussProcedure.count();
    
    if (existingCount > 0) {
      return NextResponse.json({
        message: 'Banco já possui procedimentos TUSS/CBHPM',
        count: existingCount
      });
    }

    // Inserir procedimentos em lote
    const createdProcedures = await prisma.tussProcedure.createMany({
      data: commonProcedures,
      skipDuplicates: true
    });

    return NextResponse.json({
      message: 'Procedimentos TUSS/CBHPM populados com sucesso',
      count: createdProcedures.count,
      procedures: commonProcedures.length
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao popular procedimentos TUSS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}