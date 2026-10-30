import React, { useEffect, useState } from 'react';
import Header from './layout/Header.jsx';
import Hero from './components/Hero.jsx';
import ExchangeRate from './components/ExchangeRate.jsx';
import ShippingRates from './components/ShippingRates.jsx';
import TransportSolutions from './components/TransportSolutions.jsx';
import Advantages from './components/Advantages.jsx';
import Contact from './components/Contact.jsx';
import Footer from './layout/Footer.jsx';
import DetailsPage from './pages/DetailsPage.jsx';

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  let trackingNumber = null;
  let isDetailsPage = false;
  const detailsMatch = path.match(/^\/tracking\/details\/([^/]+)\/?$/);
  if (detailsMatch) {
    isDetailsPage = true;
    try {
      trackingNumber = decodeURIComponent(detailsMatch[1]);
    } catch {
      trackingNumber = '';
    }
  } else if (path === '/details' || path === '/details.html') {
    isDetailsPage = true;
    trackingNumber = new URLSearchParams(window.location.search).get('tracking') || '';
  }

  return (
    <div className={isDetailsPage ? 'details-layout' : undefined}>
      <Header />
      {isDetailsPage ? (
        <DetailsPage trackingNumber={trackingNumber} />
      ) : (
        <main>
          <Hero />
          <ExchangeRate />
          <ShippingRates />
          <TransportSolutions />
          <Advantages />
          <Contact />
        </main>
      )}
      <Footer />
    </div>
  );
}
