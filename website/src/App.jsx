import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Home sections
import Hero from './components/Hero';
import Services from './components/Services';
import PainStrip from './components/PainStrip';
import AboutUs from './components/AboutUs';
import Process from './components/Process';
import Stack from './components/Stack';
import Pricing from './components/Pricing';
import Cases from './components/Cases';
import CtaBanner from './components/CtaBanner';
import Contact from './components/Contact';

// Pages
import ServicesPage from './pages/ServicesPage';
import GlossaryPage from './pages/GlossaryPage';
import FAQPage from './pages/FAQPage';
import SEO from './components/SEO';

function HomePage() {
  return (
    <main>
      <SEO />
      <Hero />
      <PainStrip />
      <Services />
      <AboutUs />
      <Process />
      <Stack />
      <Pricing />
      <Cases />
      <CtaBanner />
      <Contact />
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/glosario" element={<GlossaryPage />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
      <Footer />
      <ChatWidget />
    </BrowserRouter>
  );
}
