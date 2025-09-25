'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface MedicalFAQProps {
  title?: string
  faqs: FAQItem[]
  className?: string
  allowMultiple?: boolean
}

export default function MedicalFAQ({
  title = 'Perguntas Frequentes',
  faqs,
  className = '',
  allowMultiple = false,
}: MedicalFAQProps) {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  return (
    <section className={cn('py-24', className)} id='faq'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16'>
          {/* Left Column - Title */}
          <div className='lg:col-span-4'>
            <div className='sticky top-8'>
              <div className='relative'>
                <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur opacity-10'></div>
                <div className='relative bg-blue-900/5 backdrop-blur-sm rounded-lg p-6 border border-blue-700/15'>
                  <h2 className='text-xl lg:text-2xl font-semibold text-white mb-2 tracking-tight'>
                    {title}
                  </h2>
                  <div className='mt-4 h-1 w-16 bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-full'></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Items */}
          <div className='lg:col-span-8'>
            {/* FAQ Items */}
            <div className='space-y-4'>
              {faqs.map((item, index) => {
                const isOpen = openItems.includes(index)
                return (
                  <div
                    key={index}
                    className='bg-blue-900/10 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-blue-900/15 transition-all duration-300'
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      data-faq-button
                      className='w-full px-6 py-5 text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none active:outline-none'
                      style={{
                        outline: 'none !important',
                        boxShadow: 'none !important',
                      }}
                    >
                      <h3 className='text-base font-semibold text-white pr-4'>
                        {item.question}
                      </h3>
                      {isOpen ? (
                        <ChevronUpIcon className='h-5 w-5 text-gray-300 flex-shrink-0' />
                      ) : (
                        <ChevronDownIcon className='h-5 w-5 text-gray-300 flex-shrink-0' />
                      )}
                    </button>
                    {isOpen && (
                      <div className='px-6 pb-5'>
                        <p className='text-gray-200 leading-relaxed text-justify text-sm'>
                          {item.answer.split('\n').map((line, lineIndex) => (
                            <span key={lineIndex}>
                              {line}
                              {lineIndex <
                                item.answer.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* CTA Button */}
            <div className='mt-12'>
              <a
                href='/agendamento'
                className='inline-flex items-center justify-center w-full lg:w-auto px-8 py-4 bg-transparent hover:bg-transparent text-white font-bold text-base rounded-2xl transition-colors duration-300 shadow-lg hover:shadow-xl border border-white hover:border-gray-300'
              >
                AGENDAR CONSULTA
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// FAQs específicos para hemorroidas
export const hemorroidasFAQs: FAQItem[] = [
  {
    question: 'O que são hemorroidas?',
    answer:
      'Hemorroidas são veias dilatadas na região anal e retal. Podem ser internas (dentro do canal anal) ou externas (ao redor do ânus). São muito comuns e podem causar desconforto, dor, coceira e sangramento.',
  },
  {
    question: 'Quais são os principais sintomas das hemorroidas?',
    answer:
      'Os sintomas mais comuns incluem:\n• Sangramento durante ou após evacuação\n• Dor ou desconforto anal\n• Coceira na região anal\n• Sensação de peso ou pressão\n• Prolapso (saída da hemorroida para fora do ânus)',
  },
  {
    question: 'Quando devo procurar um médico?',
    answer:
      'Procure um coloproctologista se apresentar sangramento anal, dor persistente, mudança nos hábitos intestinais ou qualquer sintoma que cause preocupação. O diagnóstico precoce permite tratamento mais eficaz.',
  },
  {
    question: 'O tratamento de hemorroidas é doloroso?',
    answer:
      'Com as técnicas modernas e minimamente invasivas, o desconforto é significativamente reduzido. Utilizamos anestesia adequada e técnicas que minimizam a dor pós-operatória.',
  },
  {
    question: 'Quanto tempo leva a recuperação?',
    answer:
      'O tempo de recuperação varia conforme o tipo de tratamento. Procedimentos menos invasivos permitem retorno às atividades em poucos dias, enquanto cirurgias podem requerer 1-2 semanas de repouso.',
  },
  {
    question: 'Como prevenir o aparecimento de hemorroidas?',
    answer:
      'Para prevenir hemorroidas:\n• Mantenha uma dieta rica em fibras\n• Beba bastante água\n• Pratique exercícios regularmente\n• Evite fazer força excessiva durante evacuação\n• Não permaneça muito tempo sentado no vaso sanitário',
  },
]

// FAQs específicos para fístula anal
export const fistulaAnalFAQs: FAQItem[] = [
  {
    question: 'O que é uma fístula anal?',
    answer:
      'A fístula anal é um túnel anormal que se forma entre o canal anal e a pele ao redor do ânus. Geralmente resulta de uma infecção prévia (abscesso) que não cicatrizou adequadamente.',
  },
  {
    question: 'Quais são os sintomas de uma fístula anal?',
    answer:
      'Os sintomas incluem:\n• Drenagem de pus ou secreção\n• Dor e desconforto anal\n• Irritação da pele ao redor do ânus\n• Febre (em casos de infecção ativa)\n• Sangramento ocasional',
  },
  {
    question: 'A fístula anal sara sozinha?',
    answer:
      'Não. Na maioria dos casos, é necessário tratamento cirúrgico para fechamento definitivo do trajeto fistuloso.',
  },
  {
    question: 'Qual é o tratamento para fístula anal?',
    answer:
      'O tratamento é cirúrgico e varia conforme a complexidade da fístula. Pode incluir fistulotomia, fistulectomia, uso de sedenho ou técnicas mais avançadas como LIFT ou retalhos.',
  },
]

// FAQs específicos para fissura anal
export const fissuraAnalFAQs: FAQItem[] = [
  {
    question: 'O que é fissura anal?',
    answer:
      'A fissura anal é uma pequena ferida ou rachadura na mucosa que reveste o canal anal. É uma das causas mais comuns de dor anal intensa, especialmente durante e após a evacuação.',
  },
  {
    question: 'Quais são os sintomas da fissura anal?',
    answer:
      'Os sintomas incluem:\n• Dor anal intensa durante a evacuação\n• Dor que persiste por horas após evacuar\n• Sangramento vermelho vivo\n• Espasmo do músculo esfíncter anal\n• Coceira e irritação anal',
  },
  {
    question: 'A fissura anal sara sozinha?',
    answer:
      'Fissuras agudas podem cicatrizar com tratamento conservador adequado. Já as fissuras crônicas (mais de 6 semanas) geralmente necessitam de tratamento médico especializado ou cirúrgico.',
  },
  {
    question: 'Qual é o tratamento para fissura anal?',
    answer:
      'O tratamento pode ser conservador (pomadas, dieta rica em fibras, banhos de assento) ou cirúrgico (esfincterotomia lateral). Dr. João Vítor Viana avalia cada caso para escolher a melhor abordagem.',
  },
  {
    question: 'Como prevenir fissura anal?',
    answer:
      'Para prevenir fissuras anais:\n• Mantenha dieta rica em fibras\n• Beba bastante água\n• Evite esforço excessivo durante evacuação\n• Trate constipação adequadamente\n• Mantenha boa higiene anal',
  },
  {
    question: 'É possível fazer tratamento com botox para fissura anal?',
    answer:
      'Sim, é possível e muito eficaz. O tratamento com toxina botulínica (botox) é uma excelente opção para fissuras anais, especialmente quando o tratamento conservador não apresenta resultados satisfatórios. O botox atua relaxando o músculo esfíncter anal, reduzindo o espasmo e a dor, permitindo que a fissura cicatrize naturalmente. É um procedimento minimamente invasivo, realizado em consultório, com excelentes resultados terapêuticos.',
  },
  {
    question: 'Qual o melhor tratamento para fissura anal?',
    answer:
      'O tratamento da fissura anal pode ser clínico (pomadas, relaxantes musculares, mudanças na dieta) ou cirúrgico nos casos crônicos. Dr. João Vítor Viana avalia cada caso individualmente para definir a melhor abordagem terapêutica, considerando fatores como tempo de evolução, intensidade dos sintomas e resposta ao tratamento conservador.',
  },
]

// FAQs gerais sobre coloproctologia
export const plicomaFAQs: FAQItem[] = [
  {
    question: 'O que é plicoma?',
    answer:
      'Plicoma é um excesso de pele na região anal que geralmente resulta do processo de cicatrização após episódios de hemorroidas externas trombosadas, fissuras anais ou outros processos inflamatórios. Embora seja benigno, pode causar desconforto e dificuldades na higiene.',
  },
  {
    question: 'Quando é necessário remover o plicoma?',
    answer:
      'A remoção é indicada quando há dificuldade significativa na higiene, irritação e inflamação recorrente, sangramento por trauma, desconforto importante ou impacto na qualidade de vida do paciente.',
  },
  {
    question: 'Quais são as técnicas modernas para remoção de plicomas?',
    answer:
      'Utilizamos técnicas avançadas como laser de CO2 e bisturi de radiofrequência. Essas tecnologias dissipam menos calor durante o procedimento, resultando em menor trauma tecidual, cicatrização mais rápida e redução significativa do risco de formação de novos plicomas pós-operatórios.',
  },
  {
    question: 'Quais as vantagens do laser CO2 na remoção de plicomas?',
    answer:
      'O laser CO2 oferece precisão cirúrgica excepcional, menor sangramento durante o procedimento, cicatrização mais rápida, menor dor pós-operatória e excelente resultado estético. A tecnologia permite remoção precisa do tecido com mínimo dano aos tecidos adjacentes.',
  },
  {
    question:
      'O bisturi de radiofrequência é melhor que a cirurgia tradicional?',
    answer:
      'Sim, o bisturi de radiofrequência apresenta várias vantagens: dissipa menos calor que métodos tradicionais, reduz o trauma tecidual, promove hemostasia (controle do sangramento) mais eficaz, acelera a cicatrização e diminui significativamente o risco de complicações pós-operatórias.',
  },
  {
    question: 'A recuperação é mais rápida com essas tecnologias?',
    answer:
      'Definitivamente. As tecnologias modernas como laser CO2 e radiofrequência permitem recuperação mais rápida, com menos dor, menor tempo de afastamento das atividades e retorno mais precoce às atividades normais, geralmente em poucos dias.',
  },
]

export const cancerColorretalFAQs: FAQItem[] = [
  {
    question: 'O que é câncer colorretal?',
    answer:
      'O câncer colorretal é uma neoplasia maligna que se desenvolve no intestino grosso (cólon) ou no reto. É o terceiro tipo de câncer mais comum no Brasil e uma das principais causas de morte por câncer no mundo.',
  },
  {
    question: 'Quais são os principais sintomas do câncer colorretal?',
    answer:
      'Os sintomas incluem sangramento nas fezes, mudança no hábito intestinal, dor abdominal, sensação de evacuação incompleta, perda de peso inexplicada, fadiga, fraqueza e anemia ferropriva.',
  },
  {
    question: 'Como é feito o diagnóstico do câncer colorretal?',
    answer:
      'O diagnóstico é realizado através de colonoscopia com biópsia, tomografia computadorizada de abdome e pelve, ressonância magnética de pelve (para tumores retais) e avaliação multidisciplinar.',
  },
  {
    question: 'Qual é o tratamento para câncer colorretal?',
    answer:
      'O tratamento principal é cirúrgico, com ressecção oncológica adequada. Utilizamos técnicas minimamente invasivas como videolaparoscopia, que oferece menor trauma cirúrgico e recuperação mais rápida.',
  },
  {
    question:
      'A videolaparoscopia é eficaz no tratamento do câncer colorretal?',
    answer:
      'Sim, a videolaparoscopia permite ressecção oncológica adequada com menor trauma cirúrgico, recuperação mais rápida, menos dor pós-operatória e excelentes resultados estéticos, mantendo os mesmos princípios oncológicos da cirurgia aberta.',
  },
  {
    question: 'Qual é o prognóstico do câncer colorretal?',
    answer:
      'O prognóstico depende do estágio da doença no momento do diagnóstico. Quando detectado precocemente, as taxas de cura são muito altas. O acompanhamento oncológico completo é fundamental para o sucesso do tratamento.',
  },
]

export const cistoPilonidalFAQs: FAQItem[] = [
  {
    question: 'O que é cisto pilonidal?',
    answer:
      'O cisto pilonidal é uma cavidade anormal que se forma na região sacrococcígea (parte inferior das costas, próximo ao cóccix). Geralmente contém pelos e detritos, podendo se infectar e formar abscessos.',
  },
  {
    question: 'Quais são os sintomas do cisto pilonidal?',
    answer:
      'Os sintomas incluem dor na região do cóccix (especialmente ao sentar), inchaço e vermelhidão, drenagem de pus ou secreção com odor, presença de pelos saindo da lesão, febre em casos de infecção e dificuldade para permanecer sentado.',
  },
  {
    question: 'Qual é a vantagem da cirurgia a laser para cisto pilonidal?',
    answer:
      'A cirurgia a laser oferece uma abordagem minimamente invasiva com várias vantagens: menor ressecção de tecidos saudáveis, cicatrização mais rápida, menor dor pós-operatória, redução significativa do tempo de recuperação e retorno mais rápido às atividades normais. O paciente pode voltar ao trabalho e atividades cotidianas em poucos dias.',
  },
  {
    question: 'A técnica a laser reduz o risco de recidiva?',
    answer:
      'Sim, a cirurgia a laser apresenta menores taxas de recidiva comparada às técnicas convencionais. Isso ocorre porque a tecnologia permite tratamento mais preciso do tecido afetado, preservando tecidos saudáveis e promovendo cicatrização mais adequada.',
  },
  {
    question: 'Quanto tempo leva a recuperação com cirurgia a laser?',
    answer:
      'A recuperação com cirurgia a laser é significativamente mais rápida. A maioria dos pacientes retorna às atividades leves em 2-3 dias e às atividades normais em 1-2 semanas, comparado às 4-6 semanas das técnicas tradicionais.',
  },
  {
    question: 'O tratamento a laser é mais confortável?',
    answer:
      'Sim, o tratamento a laser proporciona maior conforto ao paciente. Há menos dor durante e após o procedimento, menor necessidade de medicações analgésicas, cicatrização mais suave e menor desconforto durante o período de recuperação.',
  },
]

export const coloproctologiaFAQs: FAQItem[] = [
  {
    question: 'O que faz um coloproctologista?',
    answer:
      'O coloproctologista é o médico especialista em doenças do intestino grosso (cólon), reto e ânus. Trata condições como hemorroidas, fissuras, fístulas, pólipos, câncer colorretal, entre outras.',
  },
  {
    question: 'Quando devo fazer uma colonoscopia?',
    answer:
      'A colonoscopia é recomendada como exame de rastreamento a partir dos 45-50 anos, ou antes se houver sintomas ou fatores de risco. Seu médico orientará sobre a necessidade e periodicidade.',
  },
  {
    question: 'O exame proctológico é constrangedor?',
    answer:
      'Entendemos que pode haver constrangimento, mas o exame é realizado com máximo respeito e privacidade. É fundamental para diagnóstico preciso e tratamento adequado.',
  },
]
