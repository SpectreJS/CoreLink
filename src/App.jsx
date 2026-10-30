import React from 'react';
import { Navigate, Route, Routes, useSearchParams, useParams } from 'react-router-dom';
import ScrollReveal from './components/ScrollReveal.jsx';
import Header from './layout/Header.jsx';
import Hero from './components/Hero.jsx';
import ExchangeRate from './components/ExchangeRate.jsx';
import ShippingRates from './components/ShippingRates.jsx';
import TransportSolutions from './components/TransportSolutions.jsx';
import Advantages from './components/Advantages.jsx';
import Contact from './components/Contact.jsx';
import Footer from './layout/Footer.jsx';
import DetailsPage from './pages/DetailsPage.jsx';

function SiteLayout({ children, details = false }) {
  return (
    <div className={details ? 'details-layout' : undefined}>
      <Header />
      {children}
      <Footer />
    </div>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      <ScrollReveal as="main">
        <Hero />
        <ExchangeRate />
        <ShippingRates />
        <TransportSolutions />
        <Advantages />
        <Contact />
      </ScrollReveal>
    </SiteLayout>
  );
}

function TrackingDetailsRoute() {
  const { trackingNumber } = useParams();
  return (
    <SiteLayout details>
      <DetailsPage trackingNumber={trackingNumber} />
    </SiteLayout>
  );
}

function LegacyDetailsRoute() {
  const [searchParams] = useSearchParams();
  return (
    <SiteLayout details>
      <DetailsPage trackingNumber={searchParams.get('tracking') || ''} />
    </SiteLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tracking/details/:trackingNumber" element={<TrackingDetailsRoute />} />
      <Route path="/details" element={<LegacyDetailsRoute />} />
      <Route path="/details.html" element={<LegacyDetailsRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
