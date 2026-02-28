'use client'

import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { DemoAnimation } from '@/components/landing/DemoAnimation'
import { FeaturesGrid } from '@/components/landing/FeaturesGrid'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <DemoAnimation />
      <FeaturesGrid />
      <Footer />
    </main>
  )
}
