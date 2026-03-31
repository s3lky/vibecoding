import './index.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Process from './components/Process';
import Stack from './components/Stack';
import Cases from './components/Cases';
import CtaBanner from './components/CtaBanner';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <Stack />
        <Cases />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
