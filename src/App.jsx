import React from 'react';
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
  const path = window.location.pathname.replace(/\/+$/, '');
  const isDetailsPage = path === '/details' || path === '/details.html';

  return (
    <div className={isDetailsPage ? 'details-layout' : undefined}>
      <Header />
      {isDetailsPage ? (
        <DetailsPage />
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
