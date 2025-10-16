import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthManager } from '@/lib/auth';
import { z } from 'zod';

const createTussProcedureSchema = z.object({
  tussCode: z.string(),
  cbhpmCode: z.string().optional(),
  description: z.string(),
  category: z.enum(['ORIFICIAL', 'PILONIDAL', 'COLECTOMY', 'OTHER']),
  unitValue: z.number().optional(),
  isActive: z.boolean().default(true)
});

// GET - Buscar procedimentos TUSS/CBHPM
export async function GET(request: NextRequest) {
  try {
    // Permitir acesso público para busca de procedimentos TUSS
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true
    };

    // Busca inteligente por código ou descrição
    if (search) {
      where.OR = [
        {
          tussCode: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          cbhpmCode: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (category) {
      where.category = category;
    }

    const [procedures, total] = await Promise.all([
      prisma.tussProcedure.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { category: 'asc' },
          { description: 'asc' }
        ]
      }),
      prisma.tussProcedure.count({ where })
    ]);

    return NextResponse.json({
      procedures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar procedimentos TUSS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo procedimento TUSS/CBHPM
export async function POST(request: NextRequest) {
  try {
    const user = AuthManager.authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createTussProcedureSchema.parse(body);

    // Verificar se o código TUSS já existe
    const existingProcedure = await prisma.tussProcedure.findUnique({
      where: { tussCode: validatedData.tussCode }
    });

    if (existingProcedure) {
      return NextResponse.json(
        { error: 'Código TUSS já existe' },
        { status: 409 }
      );
    }

    const procedure = await prisma.tussProcedure.create({
      data: validatedData
    });

    return NextResponse.json({
      message: 'Procedimento TUSS criado com sucesso',
      procedure
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar procedimento TUSS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar procedimento TUSS/CBHPM
export async function PUT(request: NextRequest) {
  try {
    const user = AuthManager.authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do procedimento é obrigatório' },
        { status: 400 }
      );
    }

    const updatedProcedure = await prisma.tussProcedure.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Procedimento TUSS atualizado com sucesso',
      procedure: updatedProcedure
    });

  } catch (error) {
    console.error('Erro ao atualizar procedimento TUSS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar procedimento TUSS/CBHPM
export async function DELETE(request: NextRequest) {
  try {
    const user = AuthManager.authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do procedimento é obrigatório' },
        { status: 400 }
      );
    }

    // Desativar ao invés de excluir para manter histórico
    await prisma.tussProcedure.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Procedimento TUSS desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao desativar procedimento TUSS:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}