'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { CardBase } from './card-base'

export interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface UniversalFAQProps {
  title?: string
  subtitle?: string
  faqData: FAQItem[]
  categories?: Record<string, string>
  showCategoryFilter?: boolean
  showContactSection?: boolean
  contactTitle?: string
  contactDescription?: string
  contactButtons?: {
    text: string
    href: string
    variant?: 'primary' | 'secondary'
  }[]
  className?: string
}

export default function UniversalFAQ({
  title = 'Perguntas Frequentes',
  subtitle = 'Encontre respostas para as principais dúvidas',
  faqData,
  categories,
  showCategoryFilter = false,
  showContactSection = false,
  contactTitle,
  contactDescription,
  contactButtons = [],
  className = '',
}: UniversalFAQProps) {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const filteredFAQ =
    selectedCategory === 'all'
      ? faqData
      : faqData.filter(item => item.category === selectedCategory)

  return (
    <section className={`py-24 ${className}`} id='faq'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          {/* Header */}
          <div className='text-center mb-16'>
            <h2 className='text-xl font-bold tracking-tight text-white sm:text-2xl'>
              {title}
            </h2>
            <p className='mt-4 text-base text-gray-300'>{subtitle}</p>
          </div>

          {/* Category Filter */}
          {showCategoryFilter && categories && (
            <div className='flex flex-wrap justify-center gap-4 mb-12'>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Todas
              </button>
              {Object.entries(categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* FAQ Items */}
          <div className='space-y-4'>
            {filteredFAQ.map((item, index) => {
              const isOpen = openItems.includes(index)
              return (
                <CardBase
                  key={index}
                  variant='default'
                  className='overflow-hidden'
                >
                  <button
                    onClick={() => toggleItem(index)}
                    data-faq-button
                    className='w-full text-left p-6 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none active:outline-none'
                    style={{
                      outline: 'none !important',
                      boxShadow: 'none !important',
                    }}
                  >
                    <div className='flex items-center justify-between'>
                      <h3 className='text-base font-semibold text-white pr-8'>
                        {item.question}
                      </h3>
                      <div className='flex-shrink-0'>
                        {isOpen ? (
                          <ChevronUpIcon className='h-5 w-5 text-gray-400' />
                        ) : (
                          <ChevronDownIcon className='h-5 w-5 text-gray-400' />
                        )}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className='px-6 pb-6'>
                      <div className='pt-4'>
                        <p className='text-gray-300 leading-relaxed text-justify text-sm'>
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </CardBase>
              )
            })}
          </div>

          {/* Contact Section */}
          {showContactSection && (
            <CardBase variant='interactive' className='mt-16'>
              <div className='text-center'>
                <h3 className='text-xl font-bold text-white mb-4'>
                  {contactTitle || 'Precisa de mais informações?'}
                </h3>
                <p className='text-gray-300 mb-8 max-w-2xl mx-auto'>
                  {contactDescription ||
                    'Entre em contato conosco para esclarecer suas dúvidas ou agendar uma consulta.'}
                </p>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  {contactButtons.map((button, index) => (
                    <a
                      key={index}
                      href={button.href}
                      className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors ${
                        button.variant === 'secondary'
                          ? 'border border-gray-600 text-white hover:bg-white/10'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {button.text}
                    </a>
                  ))}
                </div>
              </div>
            </CardBase>
          )}
        </div>
      </div>
    </section>
  )
}
