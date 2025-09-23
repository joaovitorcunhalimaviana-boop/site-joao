import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

interface MedicalAttachment {
  id: string
  fileName: string
  originalName: string
  fileType: string
  fileSize: number
  category: 'exame' | 'foto' | 'documento' | 'outro'
  description: string
  uploadedAt: string
  filePath: string
  patientId: string
}

const ATTACHMENTS_DIR = path.join(process.cwd(), 'data', 'medical-attachments')
const ATTACHMENTS_FILE = path.join(
  process.cwd(),
  'data',
  'medical-attachments.json'
)

// Função para garantir que os diretórios existem
function ensureDirectories() {
  if (!fs.existsSync(ATTACHMENTS_DIR)) {
    fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true })
  }
  const dataDir = path.dirname(ATTACHMENTS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Função para ler anexos
function readAttachments(): MedicalAttachment[] {
  ensureDirectories()
  try {
    if (fs.existsSync(ATTACHMENTS_FILE)) {
      const data = fs.readFileSync(ATTACHMENTS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Erro ao ler anexos:', error)
    return []
  }
}

// Função para salvar anexos
function saveAttachments(attachments: MedicalAttachment[]) {
  ensureDirectories()
  try {
    fs.writeFileSync(ATTACHMENTS_FILE, JSON.stringify(attachments, null, 2))
  } catch (error) {
    console.error('Erro ao salvar anexos:', error)
    throw error
  }
}

// GET - Buscar anexos por paciente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const attachmentId = searchParams.get('id')

    const attachments = readAttachments()

    if (attachmentId) {
      const attachment = attachments.find(a => a.id === attachmentId)
      if (!attachment) {
        return NextResponse.json(
          { error: 'Anexo não encontrado' },
          { status: 404 }
        )
      }
      return NextResponse.json(attachment)
    }

    if (patientId) {
      const patientAttachments = attachments.filter(
        a => a.patientId === patientId
      )
      // Ordenar por data mais recente primeiro
      patientAttachments.sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
      return NextResponse.json(patientAttachments)
    }

    return NextResponse.json(attachments)
  } catch (error) {
    console.error('Erro ao buscar anexos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Upload de novo anexo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const patientId = formData.get('patientId') as string
    const category = formData.get('category') as
      | 'exame'
      | 'foto'
      | 'documento'
      | 'outro'
    const description = formData.get('description') as string

    if (!file || !patientId) {
      return NextResponse.json(
        { error: 'Arquivo e ID do paciente são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    const attachmentId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileExtension = path.extname(file.name)
    const fileName = `${attachmentId}${fileExtension}`
    const filePath = path.join(ATTACHMENTS_DIR, fileName)

    // Salvar arquivo no disco
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Criar registro do anexo
    const attachment: MedicalAttachment = {
      id: attachmentId,
      fileName,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: category || 'outro',
      description: description || '',
      uploadedAt: new Date().toISOString(),
      filePath: fileName, // Apenas o nome do arquivo para segurança
      patientId,
    }

    // Salvar no índice
    const attachments = readAttachments()
    attachments.push(attachment)
    saveAttachments(attachments)

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
        { error: 'ID do anexo é obrigatório' },
        { status: 400 }
      )
    }

    const attachments = readAttachments()
    const attachmentIndex = attachments.findIndex(a => a.id === attachmentId)

    if (attachmentIndex === -1) {
      return NextResponse.json(
        { error: 'Anexo não encontrado' },
        { status: 404 }
      )
    }

    const attachment = attachments[attachmentIndex]

    // Remover arquivo do disco
    const filePath = path.join(ATTACHMENTS_DIR, attachment.fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Remover do índice
    attachments.splice(attachmentIndex, 1)
    saveAttachments(attachments)

    return NextResponse.json({ message: 'Anexo removido com sucesso' })
  } catch (error) {
    console.error('Erro ao remover anexo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
