// Funções temporárias de anexos médicos para corrigir os erros
import { prisma } from './prisma-service'

export interface MedicalAttachment {
  id: string
  consultationId: string
  originalName: string
  mimeType: string
  size: number
  path: string
  category: 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER'
  description?: string
  tags?: string[]
  checksum: string
  encrypted: boolean
  uploadedAt: string
  createdAt: string
  updatedAt: string
}

export async function createMedicalAttachment(attachmentData: {
  consultationId: string
  originalName: string
  mimeType: string
  size: number
  path: string
  category: 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER'
  description?: string
  tags?: string[]
  checksum?: string
  encrypted?: boolean
}): Promise<{ success: boolean; attachment?: MedicalAttachment; message: string }> {
  try {
    console.log('📎 Criando anexo médico:', attachmentData)

    // Gerar checksum simples se não fornecido
    const checksum = attachmentData.checksum || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const attachment = await prisma.medicalAttachment.create({
      data: {
        consultationId: attachmentData.consultationId,
        filename: attachmentData.originalName,
        originalName: attachmentData.originalName,
        mimeType: attachmentData.mimeType,
        size: attachmentData.size,
        path: attachmentData.path,
        category: attachmentData.category,
        description: attachmentData.description,
        tags: attachmentData.tags ? attachmentData.tags.join(',') : null,
        checksum: checksum,
        encrypted: attachmentData.encrypted || false,
        uploadedAt: new Date(),
      },
    })

    const result: MedicalAttachment = {
      id: attachment.id,
      consultationId: attachment.consultationId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      category: attachment.category as 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER',
      description: attachment.description || undefined,
      tags: attachment.tags ? attachment.tags.split(',').filter(tag => tag.trim()) : [],
      checksum: attachment.checksum,
      encrypted: attachment.encrypted,
      uploadedAt: attachment.uploadedAt.toISOString(),
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    }

    console.log('✅ Anexo médico criado com sucesso:', result.id)
    return { success: true, attachment: result, message: 'Anexo criado com sucesso' }
  } catch (error) {
    console.error('❌ Erro ao criar anexo médico:', error)
    return { success: false, message: 'Erro ao criar anexo médico' }
  }
}

export async function getMedicalAttachmentsByConsultation(consultationId: string): Promise<MedicalAttachment[]> {
  try {
    console.log('📎 Buscando anexos da consulta:', consultationId)

    const attachments = await prisma.medicalAttachment.findMany({
      where: { consultationId },
      orderBy: { createdAt: 'desc' },
    })

    const result: MedicalAttachment[] = attachments.map(attachment => ({
      id: attachment.id,
      consultationId: attachment.consultationId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      category: attachment.category as 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER',
      description: attachment.description || undefined,
      tags: attachment.tags ? attachment.tags.split(',').filter(tag => tag.trim()) : [],
      checksum: attachment.checksum,
      encrypted: attachment.encrypted,
      uploadedAt: attachment.uploadedAt.toISOString(),
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    }))

    console.log('✅ Anexos encontrados:', result.length)
    return result
  } catch (error) {
    console.error('❌ Erro ao buscar anexos da consulta:', error)
    return []
  }
}

export async function getMedicalAttachmentById(id: string): Promise<MedicalAttachment | null> {
  try {
    console.log('📎 Buscando anexo por ID:', id)

    const attachment = await prisma.medicalAttachment.findUnique({
      where: { id },
    })

    if (!attachment) {
      console.log('❌ Anexo não encontrado')
      return null
    }

    const result: MedicalAttachment = {
      id: attachment.id,
      consultationId: attachment.consultationId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      category: attachment.category as 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER',
      description: attachment.description || undefined,
      tags: attachment.tags,
      checksum: attachment.checksum,
      encrypted: attachment.encrypted,
      uploadedAt: attachment.uploadedAt.toISOString(),
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    }

    console.log('✅ Anexo encontrado:', result.id)
    return result
  } catch (error) {
    console.error('❌ Erro ao buscar anexo por ID:', error)
    return null
  }
}

export async function deleteMedicalAttachment(id: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('📎 Deletando anexo médico:', id)

    await prisma.medicalAttachment.delete({
      where: { id },
    })

    console.log('✅ Anexo médico deletado com sucesso')
    return { success: true, message: 'Anexo deletado com sucesso' }
  } catch (error) {
    console.error('❌ Erro ao deletar anexo médico:', error)
    return { success: false, message: 'Erro ao deletar anexo médico' }
  }
}

export async function getAllMedicalAttachments(): Promise<MedicalAttachment[]> {
  try {
    console.log('📎 Buscando todos os anexos médicos')

    const attachments = await prisma.medicalAttachment.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const result: MedicalAttachment[] = attachments.map(attachment => ({
      id: attachment.id,
      consultationId: attachment.consultationId,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      category: attachment.category as 'EXAM_RESULT' | 'PRESCRIPTION' | 'MEDICAL_REPORT' | 'IMAGE' | 'DOCUMENT' | 'OTHER',
      description: attachment.description || undefined,
      tags: attachment.tags ? attachment.tags.split(',').filter(tag => tag.trim()) : [],
      checksum: attachment.checksum,
      encrypted: attachment.encrypted,
      uploadedAt: attachment.uploadedAt.toISOString(),
      createdAt: attachment.createdAt.toISOString(),
      updatedAt: attachment.updatedAt.toISOString(),
    }))

    console.log('✅ Total de anexos encontrados:', result.length)
    return result
  } catch (error) {
    console.error('❌ Erro ao buscar todos os anexos médicos:', error)
    return []
  }
}