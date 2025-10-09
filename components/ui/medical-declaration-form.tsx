'use client'

import { useState } from 'react'
import { DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/outline'
import {
  formatDateToBrazilian,
  formatDateTimeToBrazilian,
} from '@/lib/date-utils'

interface MedicalDeclarationFormProps {
  patientName: string
  patientAge?: number
  patientCpf?: string
  doctorName?: string
  doctorCrm?: string
  onSave?: (declaration: {
    patientName: string
    patientAge?: number
    doctorName: string
    doctorCrm: string
    title: string
    content: string
    date: string
    createdAt: string
  }) => void
  onPrint?: () => void
}

export default function MedicalDeclarationForm({
  patientName,
  patientAge,
  patientCpf,
  doctorName = 'Dr. João Vítor Viana',
  doctorCrm = '12831-CRMPB',
  onSave,
  onPrint,
}: MedicalDeclarationFormProps) {
  const [title, setTitle] = useState('DECLARAÇÃO MÉDICA')
  const [content, setContent] = useState('')

  // Templates pré-definidos expandidos
  const templates = [
    {
      name: 'Declaração Personalizada',
      title: 'DECLARAÇÃO MÉDICA',
      content:
        'Declaro para os devidos fins que o(a) paciente [NOME_PACIENTE], [IDADE_PACIENTE] anos, portador(a) do CPF nº [CPF_PACIENTE], esteve sob meus cuidados médicos no período de [DATA_INICIO] a [DATA_FIM].\n\nApós avaliação clínica detalhada, atesto que:\n\n[ESCREVA AQUI O CONTEÚDO ESPECÍFICO DA DECLARAÇÃO]\n\nEsta declaração é emitida a pedido do(a) interessado(a) para os fins que se fizerem necessários, sendo válida por 90 (noventa) dias a partir da data de emissão.\n\nDeclaro estar ciente das responsabilidades éticas e legais inerentes a este documento.',
    },
    {
      name: 'Acompanhamento Médico',
      title: 'DECLARAÇÃO DE ACOMPANHAMENTO MÉDICO',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE] está sob meus cuidados médicos desde [DATA_INICIO] e necessita de acompanhamento médico regular.\n\nO paciente apresenta condição que requer:\n• Consultas médicas periódicas\n• Monitoramento clínico\n• Seguimento terapêutico\n\nEsta declaração é válida por tempo indeterminado, podendo ser revista conforme evolução clínica.',
    },
    {
      name: 'Capacidade para Atividades',
      title: 'DECLARAÇÃO DE CAPACIDADE FÍSICA',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE], após avaliação médica realizada em [DATA_AVALIACAO], apresenta condições clínicas para:\n\n☐ Praticar atividades físicas regulares\n☐ Participar de eventos esportivos\n☐ Viajar sem restrições\n☐ Trabalhar normalmente\n☐ Estudar sem limitações\n☐ Dirigir veículos\n☐ Outras atividades: _______________\n\nObservações: [OBSERVACOES_MEDICAS]\n\nEsta declaração tem validade de [PERIODO_VALIDADE].',
    },
    {
      name: 'Declaração de Aptidão Física',
      title: 'DECLARAÇÃO DE APTIDÃO FÍSICA',
      content:
        'Declaro para os devidos fins que o(a) paciente [NOME_PACIENTE], [IDADE_PACIENTE] anos, portador(a) do CPF nº [CPF_PACIENTE], nascido(a) em [DATA_NASCIMENTO], foi submetido(a) a exame médico clínico completo em [DATA_EXAME].\n\nApós avaliação médica criteriosa, que incluiu:\n• Anamnese detalhada\n• Exame físico completo\n• Avaliação cardiovascular\n• Análise do histórico médico\n\nATESTO que o(a) paciente encontra-se em condições de saúde adequadas e APTO(A) para a prática de:\n• Atividades físicas regulares\n• Exercícios aeróbicos de intensidade moderada a alta\n• Musculação e treinamento resistido\n• Esportes em geral\n\nObservações médicas: [OBSERVAÇÕES_ESPECÍFICAS]\n\nEsta declaração tem validade de 6 (seis) meses a partir da data de emissão, conforme legislação vigente.\n\nResponsabilizo-me tecnicamente por esta avaliação.',
    },
    {
      name: 'Uso de Medicamentos',
      title: 'DECLARAÇÃO DE USO DE MEDICAMENTOS',
      content:
        'Declaro para os devidos fins que o(a) paciente [NOME_PACIENTE], [IDADE_PACIENTE] anos, portador(a) do CPF nº [CPF_PACIENTE], está sob meus cuidados médicos e faz uso contínuo dos seguintes medicamentos sob minha prescrição e supervisão:\n\n• [MEDICAMENTO_1] - [DOSAGEM] - [FREQUENCIA]\n• [MEDICAMENTO_2] - [DOSAGEM] - [FREQUENCIA]\n• [MEDICAMENTO_3] - [DOSAGEM] - [FREQUENCIA]\n\nDiagnóstico: [CID_DIAGNÓSTICO] - [DESCRIÇÃO_DIAGNÓSTICO]\n\nO uso destes medicamentos é ESSENCIAL para o tratamento de [CONDICAO_MEDICA] e não pode ser interrompido sem supervisão médica.\n\nPosologia e orientações:\n[ORIENTAÇÕES_ESPECÍFICAS]\n\nContraindicações: [CONTRAINDICAÇÕES]\n\nEsta declaração é emitida a pedido do(a) interessado(a) para [FINALIDADE], sendo válida por 90 (noventa) dias.\n\nResponsabilizo-me tecnicamente pelas informações prestadas.',
    },
    {
      name: 'Condição de Saúde',
      title: 'DECLARAÇÃO DE CONDIÇÃO DE SAÚDE',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE] apresenta as seguintes condições de saúde:\n\n[DESCRICAO_CONDICAO]\n\nEm virtude desta condição, o paciente:\n☐ Necessita de cuidados especiais\n☐ Tem limitações para certas atividades\n☐ Requer acompanhamento médico\n☐ Outras considerações: _______________\n\nEsta declaração é emitida conforme solicitação do paciente/responsável.',
    },
    {
      name: 'Comparecimento à Consulta',
      title: 'DECLARAÇÃO DE COMPARECIMENTO MÉDICO',
      content:
        'Declaro para os devidos fins que o(a) paciente [NOME_PACIENTE], [IDADE_PACIENTE] anos, portador(a) do CPF nº [CPF_PACIENTE], compareceu à consulta médica em meu consultório no dia [DATA_CONSULTA] às [HORÁRIO].\n\nO(A) paciente permaneceu em atendimento médico das [HORA_INICIO] às [HORA_FIM], totalizando [TEMPO_TOTAL] de consulta para avaliação clínica e procedimentos necessários.\n\nO paciente foi submetido a:\n• Anamnese completa\n• Exame físico\n• Orientações médicas\n\nMotivo da consulta: [MOTIVO_CONSULTA]\n\nEsta declaração é emitida a pedido do(a) interessado(a) para comprovação de comparecimento, sendo válida para todos os fins legais.\n\nDeclaro a veracidade das informações aqui prestadas.',
    },
    {
      name: 'Aptidão para Trabalho',
      title: 'DECLARAÇÃO DE APTIDÃO LABORAL',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE], após avaliação médica, apresenta condições de saúde compatíveis com suas atividades laborais.\n\nO paciente está:\n☐ Apto para trabalho sem restrições\n☐ Apto com restrições: [ESPECIFICAR]\n☐ Temporariamente inapto\n☐ Necessita readaptação funcional\n\nEsta avaliação é válida por 6 meses, salvo intercorrências.',
    },
    {
      name: 'Necessidade de Acompanhante',
      title: 'DECLARAÇÃO DE NECESSIDADE DE ACOMPANHANTE',
      content:
        'Declaro para os devidos fins que o(a) paciente [NOME_PACIENTE], [IDADE_PACIENTE] anos, portador(a) do CPF nº [CPF_PACIENTE], está sob meus cuidados médicos e NECESSITA OBRIGATORIAMENTE de acompanhante durante o período de [PERÍODO_ESPECÍFICO] devido a [DIAGNÓSTICO_CID] - [MOTIVO_MÉDICO_DETALHADO].\n\nJustificativa médica:\n[JUSTIFICATIVA_CLÍNICA_DETALHADA]\n\nO acompanhante é INDISPENSÁVEL para:\n• Auxílio na locomoção e mobilidade\n• Supervisão na administração de medicamentos\n• Assistência em atividades de vida diária\n• Suporte emocional e psicológico\n• Comunicação com equipe médica\n\nGrau de dependência: [GRAU_DEPENDÊNCIA]\n\nEsta necessidade é baseada em critérios médicos objetivos e está amparada pela legislação vigente (Lei nº 11.108/2005 e Resolução CFM nº 1.802/2006).\n\nEsta declaração é emitida a pedido do(a) interessado(a) para [FINALIDADE_ESPECÍFICA], sendo válida por [PERÍODO_VALIDADE].\n\nResponsabilizo-me tecnicamente por esta avaliação.',
    },
    {
      name: 'Restrições Alimentares',
      title: 'DECLARAÇÃO DE RESTRIÇÕES ALIMENTARES',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE] apresenta restrições alimentares por motivos médicos:\n\n• Alimentos proibidos: [LISTAR]\n• Alimentos com restrição: [LISTAR]\n• Suplementos necessários: [LISTAR]\n\nEssas restrições são:\n☐ Permanentes\n☐ Temporárias (até [DATA])\n☐ Conforme evolução do quadro\n\nO não cumprimento pode acarretar complicações à saúde do paciente.',
    },
    {
      name: 'Vacinação Contraindicada',
      title: 'DECLARAÇÃO DE CONTRAINDICAÇÃO VACINAL',
      content:
        'Declaro que o(a) paciente [NOME_PACIENTE] apresenta contraindicação médica para as seguintes vacinas:\n\n• [VACINA_1]: [MOTIVO]\n• [VACINA_2]: [MOTIVO]\n• [VACINA_3]: [MOTIVO]\n\nEsta contraindicação é baseada em:\n☐ Alergia conhecida aos componentes\n☐ Imunodeficiência\n☐ Condição clínica específica\n☐ Outros motivos: [ESPECIFICAR]\n\nEsta declaração é válida até nova avaliação médica.',
    },
  ]

  const handleTemplateSelect = (template: (typeof templates)[0]) => {
    setTitle(template.title)
    let processedContent = template.content.replace(
      /\[NOME_PACIENTE\]/g,
      patientName
    )
    if (patientAge) {
      processedContent = processedContent.replace(
        /\[IDADE_PACIENTE\]/g,
        patientAge.toString()
      )
    }
    if (patientCpf) {
      // Formatar CPF se necessário
      const formattedCpf = patientCpf
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      processedContent = processedContent.replace(
        /\[CPF_PACIENTE\]/g,
        formattedCpf
      )
    }
    setContent(processedContent)
  }

  const handleSave = () => {
    const declaration = {
      patientName,
      patientAge,
      doctorName,
      doctorCrm,
      title,
      content,
      date: formatDateToBrazilian(new Date()),
      createdAt: formatDateTimeToBrazilian(new Date()),
    }
    onSave?.(declaration)
    alert('Declaração médica salva com sucesso!')
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <head>
        <title>Declaração Médica</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            line-height: 1.4;
            font-size: 14px;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 25px;
          }
          .doctor-info { 
            font-size: 16px; 
            font-weight: bold;
            margin-bottom: 5px;
          }
          .clinic-info {
            font-size: 13px;
            color: #666;
          }
          .declaration-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin: 25px 0;
            text-transform: uppercase;
            text-decoration: underline;
          }
          .declaration-content {
            text-align: justify;
            margin: 25px 0;
            padding: 15px;
            line-height: 1.6;
            font-size: 15px;
            min-height: 200px;
          }
          .patient-info {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #007bff;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center;
          }
          .signature { 
            margin-top: 40px; 
            border-top: 1px solid #333; 
            width: 250px; 
            margin: 40px auto 0;
            padding-top: 10px;
            text-align: center;
          }
          .date-location {
            text-align: right;
            margin: 25px 0;
            font-style: italic;
          }
          .letterhead {
            background-color: #f0f8ff;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; font-size: 12px; }
            .letterhead { background-color: #f9f9f9; padding: 10px; }
            .header { padding-bottom: 10px; margin-bottom: 20px; }
            .declaration-title { margin: 20px 0; font-size: 18px; }
            .declaration-content { min-height: auto; margin: 20px 0; }
            .footer { margin-top: 30px; }
            .signature { margin: 30px auto 0; }
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div class="header">
            <div class="doctor-info">${doctorName}</div>
            <div class="clinic-info">CRM: ${doctorCrm}</div>
            <div class="clinic-info">Cirurgia Geral e Coloproctologia</div>
            
            
            <div class="clinic-info">Endereço: Avenida Rui Barbosa, 484, Edifício Arcádia, Sala 101, Torre, João Pessoa, Paraíba</div>
          </div>
        </div>
        
        <div class="declaration-title">
          ${title}
        </div>
        
        ${
          patientAge
            ? `
          <div class="patient-info">
            <strong>Paciente:</strong> ${patientName}<br>
            <strong>Idade:</strong> ${patientAge} anos
          </div>
        `
            : `
          <div class="patient-info">
            <strong>Paciente:</strong> ${patientName}
          </div>
        `
        }
        
        <div class="declaration-content">
          ${content
            .split('\n')
            .map(line => `<p>${line}</p>`)
            .join('')}
        </div>
        
        <div class="date-location">
          João Pessoa, ${formatDateToBrazilian(new Date())}
        </div>
        
        <div class="footer">
          <div class="signature">
            ${doctorName}<br>
            CRM: ${doctorCrm}<br>
            Cirurgia Geral e Coloproctologia
          </div>
        </div>
      </body>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()

    onPrint?.()
  }

  return (
    <div>
      <div className='mb-6'>
        <h3 className='text-lg font-medium text-white flex items-center'>
          <DocumentTextIcon className='h-5 w-5 mr-2' />
          Declaração Médica
        </h3>
      </div>

      <div className='space-y-6'>
        {/* Templates */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-3'>
            Templates Disponíveis
          </label>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateSelect(template)}
                className='p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-left transition-colors'
              >
                <div className='text-white font-medium text-sm'>
                  {template.name}
                </div>
                <div className='text-gray-400 text-xs mt-1 truncate'>
                  {template.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Informações do Paciente */}
        <div className='bg-gray-700 rounded-lg p-4'>
          <h4 className='text-white font-medium mb-2'>
            Informações do Paciente
          </h4>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-300'>Nome:</span>
              <span className='text-white ml-2'>{patientName}</span>
            </div>
            {patientAge && (
              <div>
                <span className='text-gray-300'>Idade:</span>
                <span className='text-white ml-2'>{patientAge} anos</span>
              </div>
            )}
          </div>
        </div>

        {/* Título da Declaração */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            Título da Declaração
          </label>
          <input
            type='text'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Ex: DECLARAÇÃO MÉDICA'
          />
        </div>

        {/* Conteúdo da Declaração */}
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-2'>
            Conteúdo da Declaração
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={12}
            className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm'
            placeholder='Digite o conteúdo da declaração médica...\n\nDicas:\n- Use [NOME_PACIENTE] para inserir automaticamente o nome\n- Quebras de linha serão preservadas na impressão\n- Seja claro e objetivo no texto'
          />
        </div>

        {/* Preview */}
        {content && (
          <div className='bg-blue-900/20 border border-blue-600 rounded-lg p-4'>
            <h4 className='text-blue-200 font-medium mb-3'>
              Preview da Declaração
            </h4>
            <div className='bg-white text-black p-4 rounded text-sm'>
              <div className='text-center font-bold text-lg mb-4 uppercase'>
                {title}
              </div>
              <div className='mb-4'>
                <strong>Paciente:</strong> {patientName}
                {patientAge && (
                  <>
                    <br />
                    <strong>Idade:</strong> {patientAge} anos
                  </>
                )}
              </div>
              <div className='whitespace-pre-line leading-relaxed'>
                {content.split('\n').map((line, index) => (
                  <p key={index} className='mb-2'>
                    {line}
                  </p>
                ))}
              </div>
              <div className='text-right mt-8 italic'>
                João Pessoa, {formatDateToBrazilian(new Date())}
              </div>
              <div className='text-center mt-12'>
                <div className='border-t border-black w-64 mx-auto mb-2'></div>
                <div className='font-bold'>{doctorName}</div>
                <div>CRM: {doctorCrm}</div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className='flex justify-end space-x-3'>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors'
          >
            Salvar Declaração
          </button>
          <button
            onClick={handlePrint}
            disabled={!content.trim()}
            className='flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors'
          >
            <PrinterIcon className='h-4 w-4 mr-2' />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}
