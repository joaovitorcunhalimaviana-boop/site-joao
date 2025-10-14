import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import { 
  createMedicalAttachment,
  getMedicalAttachmentsByConsultation,
  getMedicalAttachmentById,
  deleteMedicalAttachment,
  getAllMedicalAttachments
} from '@/lib/medical-attachments-temp'
import AuthMiddleware from '@/lib/auth-middleware'

const ATTACHMENTS_DIR = path.join(process.cwd(), 'data', 'medical-attachments')

// Função para garantir que os diretórios existem
function ensureDirectoriesExist() {
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true })
  }
}

// GET - Buscar anexos por consulta
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consultationId = searchParams.get('consultationId')
    const attachmentId = searchParams.get('id')
    const download = searchParams.get('download') === '1'
    
    if (attachmentId) {
      // Buscar anexo específico por ID
      const attachment = await getMedicalAttachmentById(attachmentId)
      if (!attachment) {
        return NextResponse.json(
          { success: false, error: 'Anexo não encontrado' },
          { status: 404 }
        )
      }

      // Se download solicitado, tentar servir o arquivo
      if (download) {
        try {
          // Caminho pode ser absoluto ou relativo; normalizar
          const filePath = attachment.path.startsWith('.') || attachment.path.startsWith('/') || attachment.path.includes(':')
            ? attachment.path
            : path.join(ATTACHMENTS_DIR, attachment.path)

          if (!fs.existsSync(filePath)) {
            return NextResponse.json(
              { success: false, error: 'Arquivo não encontrado' },
              { status: 404 }
            )
          }

          const fileBuffer = fs.readFileSync(filePath)
          const contentType = attachment.mimeType || 'application/octet-stream'
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `inline; filename="${attachment.originalName || 'arquivo'}"`
            }
          })
        } catch (err) {
          console.error('Erro ao servir arquivo de anexo:', err)
          return NextResponse.json(
            { success: false, error: 'Erro ao abrir arquivo' },
            { status: 500 }
          )
        }
      }

      // Caso contrário, retornar metadados do anexo
      return NextResponse.json({
        success: true,
        attachment
      })
    } else if (consultationId) {
      // Buscar anexos por consulta
      const attachments = await getMedicalAttachmentsByConsultation(consultationId)
      return NextResponse.json({
        success: true,
        attachments
      })
    } else {
      // Buscar todos os anexos
      const attachments = await getAllMedicalAttachments()
      return NextResponse.json({
        success: true,
        attachments
      })
    }
  } catch (error) {
    console.error('Erro ao buscar anexos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Upload de novo anexo
export async function POST(request: NextRequest) {
  try {
    console.log('📎 [Upload] Iniciando upload de anexo médico')

    // Autenticação: exigir DOCTOR ou ADMIN conforme permissões
    const auth = await AuthMiddleware.authenticate(request)
    if (!auth.success || !auth.user) {
      return auth.response || NextResponse.json(
        { success: false, error: auth.error || 'Não autenticado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const consultationId = formData.get('consultationId') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    
    console.log('📎 [Upload] Dados recebidos:', {
      fileName: file?.name,
      fileSize: file?.size,
      consultationId,
      category,
      description
    })

    if (!file || !consultationId) {
      return NextResponse.json(
        { success: false, error: 'Arquivo e ID da consulta são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a consulta existe, se não, criar uma
    console.log('📎 [Upload] Verificando consulta:', consultationId)
    let consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    })

    if (!consultation) {
      console.log('📎 [Upload] Consulta não encontrada, tentando criar...')
      // Tentar encontrar um appointment com esse ID para criar a consulta
      const appointment = await prisma.appointment.findUnique({
        where: { id: consultationId },
        include: { medicalPatient: true }
      })

      if (appointment) {
        console.log('📎 [Upload] Appointment encontrado, criando consulta...')
        // Criar consulta baseada no appointment
        const doctorIdFromUser = auth.user.role === 'DOCTOR' ? auth.user.id : undefined
        const doctorIdToUse = doctorIdFromUser || appointment.createdBy
        if (!doctorIdToUse) {
          return NextResponse.json(
            { success: false, error: 'doctorId ausente. Faça login como médico ou informe um appointment com criador válido.' },
            { status: 400 }
          )
        }
        consultation = await prisma.consultation.create({
          data: {
            id: consultationId, // Usar o mesmo ID do appointment
            appointmentId: consultationId,
            medicalPatientId: appointment.medicalPatientId,
            doctorId: doctorIdToUse,
            status: 'IN_PROGRESS'
          }
        })
        console.log('✅ Consulta criada automaticamente:', consultation.id)
      } else {
        console.log('❌ [Upload] Appointment não encontrado')
        return NextResponse.json(
          { success: false, error: 'Consulta não encontrada e não foi possível criar automaticamente' },
          { status: 404 }
        )
      }
    } else {
      console.log('✅ [Upload] Consulta encontrada:', consultation.id)
    }

    // Validar tipo de arquivo: qualquer imagem (image/*) + documentos comuns
    const isImage = file.type?.startsWith('image/')
    const allowedDocTypes = new Set([
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])
    if (!isImage && !allowedDocTypes.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    // Garantir que os diretórios existem
    console.log('📎 [Upload] Garantindo que diretórios existem...')
    ensureDirectoriesExist()

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.name)
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`
    const filePath = path.join(ATTACHMENTS_DIR, fileName)
    console.log('📎 [Upload] Caminho do arquivo:', filePath)

    // Salvar arquivo no disco
    console.log('📎 [Upload] Salvando arquivo no disco...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    console.log('✅ [Upload] Arquivo salvo com sucesso')

    // Criar registro do anexo usando Prisma
    console.log('📎 [Upload] Criando registro no banco de dados...')
    const attachmentData = {
      consultationId,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: path.relative(process.cwd(), filePath),
      category: (category as 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER') || 'OTHER',
      description: description || undefined,
      tags: [],
      encrypted: false
    }
    console.log('📎 [Upload] Dados do anexo:', attachmentData)
    
    const result = await createMedicalAttachment(attachmentData)

    if (!result.success) {
      console.log('❌ [Upload] Erro ao criar registro:', result.message)
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }
    
    console.log('✅ [Upload] Registro criado com sucesso')

    return NextResponse.json({
      success: true,
      attachment: result.attachment
    })
  } catch (error) {
    console.error('Erro ao fazer upload do anexo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover anexo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('id')

    if (!attachmentId) {
      return NextResponse.json(
        { success: false, error: 'ID do anexo é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar anexo para obter o caminho do arquivo
    const attachment = await getMedicalAttachmentById(attachmentId)
    if (!attachment) {
      return NextResponse.json(
        { success: false, error: 'Anexo não encontrado' },
        { status: 404 }
      )
    }

    // Remover arquivo do disco
    const fullPath = path.join(process.cwd(), attachment.path)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }

    // Remover registro do banco
    const result = await deleteMedicalAttachment(attachmentId)
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Anexo removido com sucesso'
    })
  } catch (error) {
    console.error('Erro ao remover anexo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
