import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const ATTACHMENTS_DIR = join(process.cwd(), 'data', 'medical-attachments')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    if (!filename) {
      return NextResponse.json(
        { error: 'Nome do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    // Validar nome do arquivo para evitar path traversal
    // Permitir caracteres normais de filename, mas bloquear path traversal
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('\0') ||
      filename.length === 0 ||
      filename.trim() === ''
    ) {
      console.log('Filename inválido detectado:', filename)
      return NextResponse.json(
        { error: 'Nome de arquivo inválido' },
        { status: 400 }
      )
    }

    // Decodificar o filename caso tenha sido encodado
    const decodedFilename = decodeURIComponent(filename)

    const filePath = join(ATTACHMENTS_DIR, decodedFilename)

    if (!existsSync(filePath)) {
      // Tentar também com o filename original se o decodificado não existir
      const originalFilePath = join(ATTACHMENTS_DIR, filename)
      if (!existsSync(originalFilePath)) {
        console.log('Arquivo não encontrado:', { decodedFilename, filename, filePath, originalFilePath })
        return NextResponse.json(
          { error: 'Arquivo não encontrado' },
          { status: 404 }
        )
      }
      // Usar o arquivo original se encontrado
      const fileBuffer = await readFile(originalFilePath)
      return createFileResponse(fileBuffer, filename)
    }

    const fileBuffer = await readFile(filePath)
    return createFileResponse(fileBuffer, decodedFilename)
  } catch (error) {
    console.error('Erro ao buscar anexo médico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function createFileResponse(fileBuffer: Buffer, filename: string) {
  // Determinar o tipo de conteúdo baseado na extensão
  const extension = filename.split('.').pop()?.toLowerCase()
  let contentType = 'application/octet-stream'

  switch (extension) {
    case 'jpg':
    case 'jpeg':
      contentType = 'image/jpeg'
      break
    case 'png':
      contentType = 'image/png'
      break
    case 'gif':
      contentType = 'image/gif'
      break
    case 'pdf':
      contentType = 'application/pdf'
      break
    case 'doc':
      contentType = 'application/msword'
      break
    case 'docx':
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      break
    case 'txt':
      contentType = 'text/plain'
      break
  }

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
