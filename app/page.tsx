'use client'

import HeroSection from '../components/ui/hero-section'
import Header from '../components/ui/header'
import Footer from '../components/ui/footer'
import AboutSection from '../components/ui/about-section'
import FAQSection from '../components/ui/faq-section'
import { CTASection } from '../components/ui/call-to-action'
import NewsletterSection from '../components/newsletter/newsletter-section'

import StructuredData from '../components/seo/structured-data'

export default function Home() {
  return (
    <>
      <StructuredData type='doctor' />
      <StructuredData type='medicalBusiness' />
      <StructuredData type='faq' />
      <div className='min-h-screen bg-black'>
        <Header currentPage='home' />
        <main className='pt-20'>
          <HeroSection />
          <AboutSection />
          <FAQSection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </>
  )
}

