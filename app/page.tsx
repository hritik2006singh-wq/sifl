import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { MetricCard } from '@/components/MetricCard';
import { LanguageCard } from '@/components/LanguageCard';
import { TestimonialCard } from '@/components/TestimonialCard';
import { homeContent } from '@/content/home';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-grow">
        {/* HERO */}
        <Section background="gray" className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
                {homeContent.hero.headline}
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
                {homeContent.hero.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg">{homeContent.hero.primaryCta}</Button>
                <Button variant="outline" size="lg">{homeContent.hero.secondaryCta}</Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[600px] rounded-card overflow-hidden shadow-2xl">
              <Image
                src={homeContent.hero.image}
                alt="Students learning"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
            </div>
          </div>
        </Section>

        {/* TRUST METRICS */}
        <Section spacing="md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homeContent.trustMetrics.map((metric, idx) => (
              <MetricCard key={idx} value={metric.value} label={metric.label} />
            ))}
          </div>
        </Section>

        {/* PROGRAMS PREVIEW */}
        <Section background="gray">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">{homeContent.programsPreview.title}</h2>
            <p className="text-xl text-gray-600">{homeContent.programsPreview.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LanguageCard
              title="German Excellence"
              level="A1 - C2"
              description="Comprehensive German modules for academic and professional integration in the DACH region."
              image="/images/programs/german-program.jpg"
              features={['Goethe-Zertifikat Prep', 'Conversation Clinics']}
            />
            <LanguageCard
              title="Advanced English"
              level="B1 - C2"
              description="Master professional English communication for global corporate environments."
              image="/images/programs/english-program.jpg"
              features={['IELTS Preparation', 'Business English']}
            />
          </div>
        </Section>

        {/* ADVANTAGE SECTION */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-gray-100 rounded-card h-[500px] relative overflow-hidden hidden lg:block">
              {/* Decorative block equivalent to image */}
              <div className="absolute inset-0 bg-primary/5 pattern-grid-lg"></div>
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-8">{homeContent.advantage.title}</h2>
              <div className="space-y-8">
                {homeContent.advantage.points.map((point, idx) => (
                  <div key={idx} className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="ml-5">
                      <h3 className="text-xl font-bold text-foreground mb-2">{point.title}</h3>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* TESTIMONIALS */}
        <Section background="gray">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">{homeContent.successStories.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {homeContent.successStories.stories.map((story, idx) => (
              <TestimonialCard key={idx} {...story} />
            ))}
          </div>
        </Section>

        {/* JOURNEY STEPS */}
        <Section>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">{homeContent.journeySteps.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {homeContent.journeySteps.steps.map((step, idx) => (
              <div key={idx} className="text-center relative">
                <div className="text-6xl font-extrabold text-gray-100 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-foreground mb-2 relative z-10">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA SECTION */}
        <Section background="primary" className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
            {homeContent.cta.title}
          </h2>
          <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto opacity-90">
            {homeContent.cta.subtitle}
          </p>
          <Button variant="secondary" size="lg" className="text-primary font-bold hover:bg-white shadow-lg">
            {homeContent.cta.buttonText}
          </Button>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
