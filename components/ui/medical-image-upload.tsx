'use client'

import { useState, useRef } from 'react'
import {
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTimeToBrazilian } from '@/lib/date-utils'

interface MedicalImage {
  id: string
  file: File
  preview: string
  description: string
  category: 'EXAM_RESULT' | 'IMAGE' | 'DOCUMENT' | 'OTHER'
  uploadedAt: string
}

interface MedicalImageUploadProps {
  consultationId: string
  patientName: string
  onSave?: (images: MedicalImage[]) => void
}

export default function MedicalImageUpload({
  consultationId,
  patientName,
  onSave,
}: MedicalImageUploadProps) {
  const [images, setImages] = useState<MedicalImage[]>([])
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 [FileSelect] Evento de seleção de arquivo disparado')
    const files = event.target.files
    if (!files) {
      console.log('📁 [FileSelect] Nenhum arquivo selecionado')
      return
    }

    console.log('📁 [FileSelect] Arquivos selecionados:', files.length)
    
    Array.from(files).forEach((file, index) => {
      console.log(`📁 [FileSelect ${index + 1}] Processando arquivo:`, {
        name: file.name,
        type: file.type,
        size: file.size
      })
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        console.error(`📁 [FileSelect ${index + 1}] Tipo de arquivo inválido:`, file.type)
        alert('Apenas imagens (JPG, PNG, GIF) e PDFs são permitidos.')
        return
      }

      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error(`📁 [FileSelect ${index + 1}] Arquivo muito grande:`, file.size)
        alert('Arquivo muito grande. Máximo permitido: 10MB.')
        return
      }

      console.log(`📁 [FileSelect ${index + 1}] Arquivo válido, iniciando leitura`)
      
      const reader = new FileReader()
      reader.onload = e => {
        const newImage: MedicalImage = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          file,
          preview: e.target?.result as string,
          description: '',
          category: 'EXAM_RESULT',
          uploadedAt: formatDateTimeToBrazilian(new Date()),
        }
        console.log(`📁 [FileSelect ${index + 1}] Imagem adicionada ao array:`, newImage.id)
        setImages(prev => {
          const updated = [...prev, newImage]
          console.log('📁 [FileSelect] Total de imagens no array:', updated.length)
          return updated
        })
      }
      reader.readAsDataURL(file)
    })

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId))
  }

  const handleUpdateImage = (
    imageId: string,
    updates: Partial<MedicalImage>
  ) => {
    setImages(prev =>
      prev.map(img => (img.id === imageId ? { ...img, ...updates } : img))
    )
  }

  const handleSaveAll = async () => {
    if (images.length === 0) {
      alert('Nenhuma imagem para salvar')
      return
    }

    console.log('🚀 [Upload] Iniciando upload de', images.length, 'imagens')
    console.log('🚀 [Upload] ConsultationId:', consultationId)
    console.log('🚀 [Upload] Imagens:', images.map(img => ({ 
      filename: img.file.name, 
      size: img.file.size, 
      category: img.category, 
      description: img.description 
    })))

    try {
      const uploadPromises = images.map(async (image, index) => {
        console.log(`📤 [Upload ${index + 1}] Preparando upload de:`, image.file.name)
        
        const formData = new FormData()
        formData.append('file', image.file)
        formData.append('consultationId', consultationId)
        formData.append('category', image.category)
        formData.append('description', image.description)

        console.log(`📤 [Upload ${index + 1}] Enviando requisição para /api/medical-attachments`)
        
        const response = await fetch('/api/medical-attachments', {
          method: 'POST',
          body: formData,
        })

        console.log(`📥 [Upload ${index + 1}] Resposta recebida:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ [Upload ${index + 1}] Erro na resposta:`, errorText)
          throw new Error(`Erro ao fazer upload: ${response.statusText}`)
        }

        return await response.json()
      })

      const uploadedAttachments = await Promise.all(uploadPromises)

      alert(
        `${images.length} anexo(s) salvo(s) com sucesso no prontuário de ${patientName}!`
      )

      // Chamar callback se fornecido
      if (onSave) {
        onSave(uploadedAttachments)
      }

      // Limpar imagens após salvar
      setImages([])
    } catch (error) {
      console.error('Erro ao salvar anexos:', error)
      alert('Erro ao salvar anexos. Tente novamente.')
    }
  }

  const openImageModal = (image: MedicalImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
    setIsModalOpen(false)
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-medium text-white flex items-center'>
            <PhotoIcon className='h-5 w-5 mr-2' />
            Anexos do Prontuário
          </h3>
          <p className='text-sm text-gray-400 mt-1'>
            Adicione exames, fotos e documentos ao prontuário de {patientName}
          </p>
        </div>

        {images.length > 0 && (
          <Button
            onClick={handleSaveAll}
            className='bg-green-600 hover:bg-green-700 text-white'
          >
            Salvar Todos ({images.length})
          </Button>
        )}
      </div>

      {/* Upload Area */}
      <Card className='bg-gray-800 border-gray-700'>
        <CardContent className='p-6'>
          <div
            className='border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer'
            onClick={() => fileInputRef.current?.click()}
          >
            <DocumentArrowUpIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <p className='text-white font-medium mb-2'>
              Clique para adicionar arquivos
            </p>
            <p className='text-sm text-gray-400'>
              Suporte para imagens (JPG, PNG, GIF) e PDFs até 10MB
            </p>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*,.pdf'
              onChange={handleFileSelect}
              className='hidden'
            />
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {images.map(image => (
            <Card key={image.id} className='bg-gray-800 border-gray-700'>
              <CardContent className='p-4'>
                {/* Image Preview */}
                <div className='relative mb-3'>
                  {image.file.type.startsWith('image/') ? (
                    <img
                      src={image.preview}
                      alt='Preview'
                      className='w-full h-32 object-cover rounded cursor-pointer'
                      onClick={() => openImageModal(image)}
                    />
                  ) : (
                    <div
                      className='w-full h-32 bg-gray-700 rounded flex items-center justify-center cursor-pointer'
                      onClick={() => openImageModal(image)}
                    >
                      <DocumentArrowUpIcon className='h-8 w-8 text-gray-400' />
                      <span className='text-sm text-gray-400 ml-2'>PDF</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='absolute top-2 right-2 flex space-x-1'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-6 w-6 p-0 bg-black/50 border-gray-600 hover:bg-black/70'
                      onClick={() => openImageModal(image)}
                    >
                      <EyeIcon className='h-3 w-3 text-white' />
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='h-6 w-6 p-0 bg-red-600/50 border-red-600 hover:bg-red-600/70'
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      <TrashIcon className='h-3 w-3 text-white' />
                    </Button>
                  </div>
                </div>

                {/* File Info */}
                <div className='space-y-2'>
                  <p className='text-xs text-gray-400 truncate'>
                    {image.file.name}
                  </p>

                  {/* Category */}
                  <select
                    value={image.category}
                    onChange={e =>
                      handleUpdateImage(image.id, {
                        category: e.target.value as MedicalImage['category'],
                      })
                    }
                    className='w-full text-xs bg-gray-700 border-gray-600 text-white rounded px-2 py-1'
                  >
                    <option value='EXAM_RESULT'>Exame</option>
                    <option value='IMAGE'>Foto Clínica</option>
                    <option value='DOCUMENT'>Documento</option>
                    <option value='OTHER'>Outro</option>
                  </select>

                  {/* Description */}
                  <Textarea
                    placeholder='Descrição do arquivo...'
                    value={image.description}
                    onChange={e =>
                      handleUpdateImage(image.id, {
                        description: e.target.value,
                      })
                    }
                    className='text-xs bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[60px]'
                  />

                  <p className='text-xs text-gray-500'>
                    Adicionado em: {image.uploadedAt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Image Preview */}
      {isModalOpen && selectedImage && (
        <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
          <div className='bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-auto'>
            <div className='p-4 border-b border-gray-700 flex items-center justify-between'>
              <h3 className='text-lg font-medium text-white'>
                {selectedImage.file.name}
              </h3>
              <Button
                variant='outline'
                size='sm'
                onClick={closeImageModal}
                className='border-gray-600 text-gray-300 hover:bg-gray-700'
              >
                Fechar
              </Button>
            </div>

            <div className='p-4'>
              {selectedImage.file.type.startsWith('image/') ? (
                <img
                  src={selectedImage.preview}
                  alt='Preview ampliado'
                  className='max-w-full max-h-[70vh] object-contain mx-auto'
                />
              ) : (
                <div className='text-center py-12'>
                  <DocumentArrowUpIcon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  <p className='text-white'>Arquivo PDF</p>
                  <p className='text-sm text-gray-400 mt-2'>
                    {selectedImage.file.name}
                  </p>
                </div>
              )}

              {selectedImage.description && (
                <div className='mt-4 p-3 bg-gray-700 rounded'>
                  <p className='text-sm text-gray-300'>
                    <strong>Descrição:</strong> {selectedImage.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
