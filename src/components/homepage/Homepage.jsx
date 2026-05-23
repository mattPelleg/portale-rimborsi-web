import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plane, Clock, AlertCircle, Users, Briefcase, TrendingUp, 
  ArrowRight, User, Lock, CheckCircle2, Star, Zap
} from 'lucide-react';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const refundCases = [
    {
      id: 1,
      title: "Ritardo Aereo",
      description: "Rimborso per voli in ritardo superiore a 3 ore.",
      amount: "€250 - €600",
      icon: <Clock className="case-icon case-icon-blue" />,
      details: "Compensazione automatica per ritardi superiori a 3 ore su voli europei",
      bgColor: "case-card-blue",
      features: ["3+ ore ritardo", "Voli Europei", "Compensazione diretta"]
    },
    {
      id: 2,
      title: "Volo Cancellato",
      description: "Rimborso completo e compensazione per cancellazioni.",
      amount: "€250 - €600",
      icon: <AlertCircle className="case-icon case-icon-red" />,
      details: "Rimborso totale + compensazione per cancellazioni improvvise",
      bgColor: "case-card-red",
      features: ["Rimborso totale", "Cancellazione improvvisa", "Compensazione"]
    },
    {
      id: 3,
      title: "Overbooking",
      description: "Compensazione per sovraprenotazione della compagnia.",
      amount: "€250 - €600",
      icon: <Users className="case-icon case-icon-orange" />,
      details: "Diritto a compensazione immediata per overbooking involontario",
      bgColor: "case-card-orange",
      features: ["Sovraprenotazione", "Esclusione dal volo", "Diritto immediato"]
    },
    {
      id: 4,
      title: "Bagaglio Smarrito",
      description: "Rimborso per bagagli smarriti o danneggiati.",
      amount: "€1.000 - €1.500",
      icon: <Briefcase className="case-icon case-icon-purple" />,
      details: "Compensazione per danni materiali e disagi causati dalla perdita",
      bgColor: "case-card-purple",
      features: ["Bagagli smarriti", "Bagagli danneggiati", "Risarcimento"]
    },
    {
      id: 5,
      title: "Perdita Coincidenza",
      description: "Rimborso per perdita di voli di coincidenza.",
      amount: "€250 - €600",
      icon: <Plane className="case-icon case-icon-green" />,
      details: "Compensazione per coincidenze perse per responsabilità della compagnia",
      bgColor: "case-card-green",
      features: ["Coincidenza persa", "Responsabilità compagnia", "Compensazione"]
    },
    {
      id: 6,
      title: "Declassamento",
      description: "Rimborso parziale per declassamento di classe.",
      amount: "30% - 75%",
      icon: <TrendingUp className="case-icon case-icon-indigo" />,
      details: "Rimborso percentuale del prezzo per declassamento involontario",
      bgColor: "case-card-indigo",
      features: ["Classe inferiore", "Involontario", "Rimborso %"]
    }
  ];

  const features = [
    { icon: <CheckCircle2 size={24} />, title: "100% Trasparenza", desc: "Nessuna commissione nascosta" },
    { icon: <Zap size={24} />, title: "Veloce & Affidabile", desc: "Tempi rapidi di elaborazione" },
    { icon: <Star size={24} />, title: "Supporto 24/7", desc: "Team sempre disponibile" }
  ];

  const stats = [
    { number: "15K+", label: "Clienti soddisfatti" },
    { number: "€2.5M+", label: "Recuperati" },
    { number: "98%", label: "Tasso successo" }
  ];

  const handleCardClick = (cardId) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const handleNavigate = (path) => navigate(path);

  return (
    <div className="homepage-container">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="blob blob-1" style={{ transform: `translateY(${scrollY * 0.5}px)` }}></div>
        <div className="blob blob-2" style={{ transform: `translateY(${scrollY * -0.3}px)` }}></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <Plane className="plane-icon" />
            </div>
            <h1 className="logo-text">EasyFlyRefund</h1>
          </div>
          
          <div className="login-section">
            <button 
              className="login-btn"
              onClick={() => handleNavigate('/login')}
            >
              <User size={18} />
              <span>Accedi</span>
              <Lock size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>Recupera i tuoi diritti aerei</span>
          </div>

          <h2 className="hero-title">
            Il tuo rimborso aereo <span className="gradient-text">garantito</span>
          </h2>

          <p className="hero-subtitle">
            Gestione professionale dei rimborsi aerei secondo il Regolamento UE 261/2004. 
            Zero commissioni nascoste, trasparenza totale.
          </p>

          <div className="hero-stats">
            {stats.map((stat, idx) => (
              <div key={idx} className="hero-stat-item">
                <div className="hero-stat-number">{stat.number}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="hero-cta">
            <button 
              className="hero-btn-primary"
              onClick={() => handleNavigate('/login')}
            >
              Inizia Richiesta
              <ArrowRight size={18} />
            </button>
            <button className="hero-btn-secondary">
              Scopri di Più
            </button>
          </div>
        </div>

        <div className="hero-illustration">
          <div className="plane-illustration">
            <Plane size={120} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h3 className="section-title">Perché scegliere noi?</h3>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="cases-section">
        <div className="cases-content">
          <h3 className="section-title">Casi di Rimborso Gestiti</h3>
          <p className="section-subtitle">
            Scopri tutti i casi in cui puoi richiedere un rimborso
          </p>

          <div className="cases-grid">
            {refundCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className={`case-card ${caseItem.bgColor} ${
                  selectedCard === caseItem.id ? 'case-card-selected' : ''
                }`}
                onClick={() => handleCardClick(caseItem.id)}
              >
                <div className="case-header">
                  <div className="case-icon-wrapper">
                    {caseItem.icon}
                  </div>
                  <h4 className="case-title">{caseItem.title}</h4>
                </div>

                <p className="case-description">{caseItem.description}</p>

                <div className="amount-badge">
                  <span className="amount-label">Fino a</span>
                  <span className="amount-value">{caseItem.amount}</span>
                </div>

                {selectedCard === caseItem.id && (
                  <div className="case-expanded">
                    <div className="case-details">
                      <p>{caseItem.details}</p>
                    </div>
                    <div className="case-features">
                      {caseItem.features.map((feature, idx) => (
                        <span key={idx} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="case-footer">
                  {selectedCard === caseItem.id ? '▼ Chiudi' : '▶ Dettagli'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="how-it-works-content">
          <h3 className="section-title">Come Funziona</h3>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4 className="step-title">Verifica il tuo diritto</h4>
              <p className="step-desc">Controlla se il tuo caso rientra nella normativa UE 261/2004</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h4 className="step-title">Registrati e invia</h4>
              <p className="step-desc">Crea un account e carica i documenti del tuo volo</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h4 className="step-title">Noi ci occupiamo</h4>
              <p className="step-desc">Il nostro team gestisce la pratica con la compagnia aerea</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h4 className="step-title">Ricevi il rimborso</h4>
              <p className="step-desc">Ottieni il compenso direttamente nel tuo conto</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h3 className="cta-title">Pronto a recuperare il tuo rimborso?</h3>
          <p className="cta-subtitle">
            Accedi al portale e inizia la procedura in pochi minuti
          </p>
          <button 
            className="cta-btn-primary"
            onClick={() => handleNavigate('/login')}
          >
            Accedi al Portale Rimborsi
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <Plane size={24} />
                </div>
                <h4>EasyFlyRefund</h4>
              </div>
              <p className="footer-description">
                Servizio professionale per la gestione dei rimborsi aerei secondo la normativa europea.
              </p>
            </div>
            
            <div className="footer-column">
              <h5 className="footer-column-title">Servizi</h5>
              <ul className="footer-links">
                <li>Rimborsi Ritardi</li>
                <li>Voli Cancellati</li>
                <li>Overbooking</li>
                <li>Bagagli Smarriti</li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h5 className="footer-column-title">Info</h5>
              <ul className="footer-links">
                <li>Chi Siamo</li>
                <li>FAQ</li>
                <li>Contatti</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2025 EasyFlyRefund. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;