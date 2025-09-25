import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calculadoras Médicas Acessíveis',
  description:
    'Calculadoras médicas com recursos de acessibilidade avançados, incluindo navegação por teclado, leitores de tela e contraste ajustável.',
  keywords: [
    'calculadora médica acessível',
    'IMC acessível',
    'TMB acessível',
    'calculadora médica inclusiva',
    'acessibilidade médica',
    'WCAG calculadora',
    'leitor de tela calculadora',
  ],
}

export default function CalculadorasAcessiveisPage() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <div className='container mx-auto px-4'>
        <header className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Calculadoras Médicas Acessíveis
          </h1>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto'>
            Ferramentas de cálculo médico desenvolvidas com foco em
            acessibilidade, seguindo as diretrizes WCAG 2.1 AA para garantir que
            todos possam utilizar essas importantes ferramentas de saúde.
          </p>
        </header>

        <div className='mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3'>
            Recursos de Acessibilidade
          </h2>
          <ul className='space-y-2 text-blue-800 dark:text-blue-200'>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>
                Navegação completa por teclado com indicadores visuais de foco
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>
                Compatibilidade total com leitores de tela (NVDA, JAWS,
                VoiceOver)
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>ARIA labels e roles para melhor compreensão semântica</span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>Contraste de cores ajustável (normal, alto, máximo)</span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>Tamanhos de fonte personalizáveis</span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>
                Opção de reduzir animações para usuários sensíveis ao movimento
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>
                Anúncios automáticos de resultados para leitores de tela
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 dark:text-blue-400 mr-2'>✓</span>
              <span>Validação de formulário com mensagens de erro claras</span>
            </li>
          </ul>
        </div>

        <div className='mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6'>
          <h2 className='text-xl font-semibold text-amber-900 dark:text-amber-100 mb-3'>
            Como Usar
          </h2>
          <div className='space-y-3 text-amber-800 dark:text-amber-200'>
            <p>
              <strong>Navegação por Teclado:</strong> Use Tab para navegar entre
              campos, Enter para ativar botões, e as setas para selecionar
              opções em grupos de radio.
            </p>
            <p>
              <strong>Configurações de Acessibilidade:</strong> Clique no ícone
              de configurações no canto superior direito para ajustar tema,
              contraste, tamanho da fonte e animações.
            </p>
            <p>
              <strong>Leitores de Tela:</strong> Todos os campos possuem labels
              descritivos e os resultados são anunciados automaticamente quando
              calculados.
            </p>
          </div>
        </div>

        <div className='text-center py-12'>
          <h2 className='text-2xl font-semibold text-gray-900 dark:text-white mb-4'>
            Calculadoras Temporariamente Indisponíveis
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Esta seção está sendo atualizada. Em breve, novas calculadoras
            estarão disponíveis.
          </p>
        </div>

        <footer className='mt-12 text-center text-gray-600 dark:text-gray-400'>
          <p className='mb-2'>
            Desenvolvido seguindo as diretrizes de acessibilidade WCAG 2.1 AA
          </p>
          <p className='text-sm'>
            Para sugestões de melhorias de acessibilidade, entre em contato
            conosco.
          </p>
        </footer>
      </div>
    </div>
  )
}
