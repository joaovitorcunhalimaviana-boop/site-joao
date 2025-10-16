'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PainScale } from '@/components/ui/pain-scale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface PostOpFollowUpFormProps {
  surgeryId: string
  followUpDay: number
  patientName: string
  surgeryType: string
  surgeryDate: string
  onSubmit: (data: PostOpFollowUpData) => void
  onCancel: () => void
  initialData?: Partial<PostOpFollowUpData>
  disabled?: boolean
}

export interface PostOpFollowUpData {
  surgeryId: string
  followUpDay: number
  painScaleRest: number
  painScaleMovement: number
  bowelFunction: 'normal' | 'constipated' | 'diarrhea' | 'not_applicable'
  bleeding: boolean
  bleedingDescription?: string
  constipation: boolean
  nausea: boolean
  vomiting: boolean
  appetite: 'normal' | 'reduced' | 'absent'
  sleep: 'normal' | 'disturbed' | 'insomnia'
  mobility: 'normal' | 'limited' | 'bed_rest'
  woundHealing: 'normal' | 'concerning' | 'infected'
  medicationCompliance: 'full' | 'partial' | 'none'
  concerns: string
  notes: string
  patientSatisfaction: number // 1-5
  wouldRecommend: boolean
}

const followUpQuestions = {
  1: {
    title: '1º Dia Pós-Operatório',
    focus: ['dor', 'sangramento', 'náusea', 'mobilidade'],
    description: 'Avaliação inicial da recuperação'
  },
  4: {
    title: '4º Dia Pós-Operatório',
    focus: ['dor', 'cicatrização', 'função intestinal', 'apetite'],
    description: 'Avaliação da evolução da recuperação'
  },
  7: {
    title: '7º Dia Pós-Operatório (1 Semana)',
    focus: ['dor', 'cicatrização', 'mobilidade', 'retorno às atividades'],
    description: 'Avaliação do progresso semanal'
  },
  14: {
    title: '14º Dia Pós-Operatório (2 Semanas)',
    focus: ['satisfação', 'retorno completo', 'recomendação'],
    description: 'Avaliação final da recuperação'
  }
}

export function PostOpFollowUpForm({
  surgeryId,
  followUpDay,
  patientName,
  surgeryType,
  surgeryDate,
  onSubmit,
  onCancel,
  initialData,
  disabled = false
}: PostOpFollowUpFormProps) {
  const [formData, setFormData] = useState<PostOpFollowUpData>({
    surgeryId,
    followUpDay,
    painScaleRest: initialData?.painScaleRest || 0,
    painScaleMovement: initialData?.painScaleMovement || 0,
    bowelFunction: initialData?.bowelFunction || 'normal',
    bleeding: initialData?.bleeding || false,
    bleedingDescription: initialData?.bleedingDescription || '',
    constipation: initialData?.constipation || false,
    nausea: initialData?.nausea || false,
    vomiting: initialData?.vomiting || false,
    appetite: initialData?.appetite || 'normal',
    sleep: initialData?.sleep || 'normal',
    mobility: initialData?.mobility || 'normal',
    woundHealing: initialData?.woundHealing || 'normal',
    medicationCompliance: initialData?.medicationCompliance || 'full',
    concerns: initialData?.concerns || '',
    notes: initialData?.notes || '',
    patientSatisfaction: initialData?.patientSatisfaction || 5,
    wouldRecommend: initialData?.wouldRecommend || true
  })

  const handlePainScaleChange = (restPain: number, movementPain: number) => {
    setFormData(prev => ({
      ...prev,
      painScaleRest: restPain,
      painScaleMovement: movementPain
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const currentQuestions = followUpQuestions[followUpDay as keyof typeof followUpQuestions]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {currentQuestions.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentQuestions.description}
              </p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p><strong>Paciente:</strong> {patientName}</p>
              <p><strong>Cirurgia:</strong> {surgeryType}</p>
              <p><strong>Data:</strong> {new Date(surgeryDate).toLocaleDateString('pt-BR')}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Escala de Dor */}
            <div>
              <PainScale
                onScaleChange={handlePainScaleChange}
                initialRestPain={formData.painScaleRest}
                initialMovementPain={formData.painScaleMovement}
                disabled={disabled}
              />
            </div>

            {/* Sintomas Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sintomas e Condições Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Sangramento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bleeding"
                      checked={formData.bleeding}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, bleeding: checked as boolean }))
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="bleeding" className="font-medium">
                      Presença de sangramento
                    </Label>
                  </div>
                  {formData.bleeding && (
                    <Textarea
                      placeholder="Descreva o sangramento (localização, intensidade, frequência)"
                      value={formData.bleedingDescription}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, bleedingDescription: e.target.value }))
                      }
                      disabled={disabled}
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Outros sintomas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="constipation"
                      checked={formData.constipation}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, constipation: checked as boolean }))
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="constipation">Constipação</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="nausea"
                      checked={formData.nausea}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, nausea: checked as boolean }))
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="nausea">Náusea</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="vomiting"
                      checked={formData.vomiting}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, vomiting: checked as boolean }))
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="vomiting">Vômito</Label>
                  </div>
                </div>

                {/* Função Intestinal */}
                <div className="space-y-3">
                  <Label className="font-medium">Função Intestinal</Label>
                  <RadioGroup
                    value={formData.bowelFunction}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, bowelFunction: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="bowel-normal" />
                      <Label htmlFor="bowel-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="constipated" id="bowel-constipated" />
                      <Label htmlFor="bowel-constipated">Constipado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="diarrhea" id="bowel-diarrhea" />
                      <Label htmlFor="bowel-diarrhea">Diarreia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_applicable" id="bowel-na" />
                      <Label htmlFor="bowel-na">Não se aplica</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Apetite */}
                <div className="space-y-3">
                  <Label className="font-medium">Apetite</Label>
                  <RadioGroup
                    value={formData.appetite}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, appetite: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="appetite-normal" />
                      <Label htmlFor="appetite-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reduced" id="appetite-reduced" />
                      <Label htmlFor="appetite-reduced">Reduzido</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="absent" id="appetite-absent" />
                      <Label htmlFor="appetite-absent">Ausente</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Sono */}
                <div className="space-y-3">
                  <Label className="font-medium">Qualidade do Sono</Label>
                  <RadioGroup
                    value={formData.sleep}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, sleep: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="sleep-normal" />
                      <Label htmlFor="sleep-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="disturbed" id="sleep-disturbed" />
                      <Label htmlFor="sleep-disturbed">Perturbado</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="insomnia" id="sleep-insomnia" />
                      <Label htmlFor="sleep-insomnia">Insônia</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Mobilidade */}
                <div className="space-y-3">
                  <Label className="font-medium">Mobilidade</Label>
                  <RadioGroup
                    value={formData.mobility}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, mobility: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="mobility-normal" />
                      <Label htmlFor="mobility-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited" id="mobility-limited" />
                      <Label htmlFor="mobility-limited">Limitada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bed_rest" id="mobility-bed" />
                      <Label htmlFor="mobility-bed">Repouso no leito</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Cicatrização */}
                <div className="space-y-3">
                  <Label className="font-medium">Cicatrização da Ferida</Label>
                  <RadioGroup
                    value={formData.woundHealing}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, woundHealing: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="wound-normal" />
                      <Label htmlFor="wound-normal">Normal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="concerning" id="wound-concerning" />
                      <Label htmlFor="wound-concerning">Preocupante</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="infected" id="wound-infected" />
                      <Label htmlFor="wound-infected">Infectada</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Adesão à medicação */}
                <div className="space-y-3">
                  <Label className="font-medium">Adesão à Medicação</Label>
                  <RadioGroup
                    value={formData.medicationCompliance}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, medicationCompliance: value as any }))
                    }
                    disabled={disabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="med-full" />
                      <Label htmlFor="med-full">Completa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partial" id="med-partial" />
                      <Label htmlFor="med-partial">Parcial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="med-none" />
                      <Label htmlFor="med-none">Nenhuma</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Avaliação de Satisfação (apenas no 14º dia) */}
            {followUpDay === 14 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avaliação de Satisfação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="font-medium">
                      Satisfação geral com o procedimento (1-5 estrelas)
                    </Label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => 
                            setFormData(prev => ({ ...prev, patientSatisfaction: star }))
                          }
                          disabled={disabled}
                          className={`
                            text-2xl transition-colors
                            ${star <= formData.patientSatisfaction 
                              ? 'text-yellow-400' 
                              : 'text-gray-300'
                            }
                            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-yellow-300'}
                          `}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recommend"
                      checked={formData.wouldRecommend}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, wouldRecommend: checked as boolean }))
                      }
                      disabled={disabled}
                    />
                    <Label htmlFor="recommend" className="font-medium">
                      Recomendaria este procedimento para outros pacientes
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preocupações e Observações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="concerns" className="font-medium">
                    Preocupações ou dúvidas
                  </Label>
                  <Textarea
                    id="concerns"
                    placeholder="Descreva qualquer preocupação, dúvida ou sintoma não mencionado acima"
                    value={formData.concerns}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, concerns: e.target.value }))
                    }
                    disabled={disabled}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="font-medium">
                    Observações gerais
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Outras observações sobre sua recuperação"
                    value={formData.notes}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, notes: e.target.value }))
                    }
                    disabled={disabled}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={disabled}
              >
                Salvar Follow-up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}