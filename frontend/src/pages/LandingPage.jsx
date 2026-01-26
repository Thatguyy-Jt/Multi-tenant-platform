import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import TrustSignals from '../components/landing/TrustSignals';
import Features from '../components/landing/Features';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import Integrations from '../components/landing/Integrations';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="bg-black min-h-screen text-zinc-100 selection:bg-teal-500/30 selection:text-teal-200">
      <Navbar />
      <Hero />
      <TrustSignals />
      <Features />
      <Testimonials />
      <Pricing />
      <Integrations />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
