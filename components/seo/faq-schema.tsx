import Script from 'next/script'

export default function FAQSchema() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quem é o Dr. João Vítor Viana?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. João Vítor Viana é proctologista especializado em João Pessoa/PB, com mais de 10 anos de experiência no tratamento de hemorroidas, fístula anal, fissura anal e plicoma. Oferece atendimento humanizado com tecnologia de ponta.',
        },
      },
      {
        '@type': 'Question',
        name: 'Qual médico trata hemorroidas em João Pessoa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. João Vítor Viana é especialista no tratamento de hemorroidas em João Pessoa, utilizando técnicas modernas como ligadura elástica, escleroterapia e cirurgia minimamente invasiva para hemorroidas internas e externas.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como é feita a cirurgia de fístula anal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A cirurgia de fístula anal pode ser realizada através de fistulotomia (abertura do trajeto) ou fistulectomia (remoção do trajeto). Dr. João Vítor Viana utiliza técnicas preservadoras do esfíncter para manter a continência anal.',
        },
      },
      {
        '@type': 'Question',
        name: 'Qual o tratamento para fissura anal?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O tratamento de fissura anal pode ser conservador (pomadas, dieta, banhos de assento) ou cirúrgico (esfincterotomia lateral). Dr. João Vítor Viana avalia cada caso individualmente para escolher a melhor abordagem.',
        },
      },
      {
        '@type': 'Question',
        name: 'O que é plicoma e como tratar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Plicoma é o excesso de pele na região anal, geralmente resultante de hemorroidas trombosadas. O tratamento é cirúrgico, com remoção da pele redundante. Dr. João Vítor Viana realiza o procedimento com técnica refinada para excelente resultado estético.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quando procurar um proctologista?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Procure um proctologista ao apresentar sangramento anal, dor durante evacuação, coceira persistente, inchaço na região anal, alterações no hábito intestinal ou presença de caroços. Dr. João Vítor Viana oferece avaliação completa em João Pessoa.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hemorroidas têm cura?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, hemorroidas têm cura. O tratamento varia desde medidas conservadoras até procedimentos cirúrgicos, dependendo do grau. Dr. João Vítor Viana oferece todas as opções terapêuticas modernas em João Pessoa.',
        },
      },
      {
        '@type': 'Question',
        name: 'Qual a diferença entre proctologista e coloproctologista?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Proctologista foca nas doenças do ânus e reto, enquanto coloproctologista trata todo o intestino grosso (cólon, reto e ânus). Dr. João Vítor Viana é especialista em ambas as áreas, oferecendo tratamento completo.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como é a recuperação da cirurgia de hemorroidas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A recuperação varia de 1-3 semanas, dependendo da técnica utilizada. Dr. João Vítor Viana orienta cuidados específicos como dieta, higiene e medicações para uma recuperação mais confortável e rápida.',
        },
      },
      {
        '@type': 'Question',
        name: 'Fístula anal volta depois da cirurgia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Com técnica cirúrgica adequada, a recidiva de fístula anal é rara. Dr. João Vítor Viana utiliza métodos modernos e acompanhamento pós-operatório rigoroso para minimizar o risco de recorrência.',
        },
      },
      {
        '@type': 'Question',
        name: 'Dr. João Vítor Viana atende convênios?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. João Vítor Viana atende diversos planos de saúde em João Pessoa. Entre em contato para verificar se seu convênio está credenciado e agendar sua consulta proctológica.',
        },
      },
      {
        '@type': 'Question',
        name: 'Onde fica o consultório do Dr. João Vítor Viana?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dr. João Vítor Viana atende em João Pessoa/PB, na Rua das Trincheiras, 456. O consultório conta com estrutura moderna e tecnologia de ponta para diagnóstico e tratamento proctológico.',
        },
      },
    ],
  }

  return (
    <Script
      id='faq-schema'
      type='application/ld+json'
      strategy='afterInteractive'
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema),
      }}
    />
  )
}
