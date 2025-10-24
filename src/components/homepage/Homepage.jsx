import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Clock, AlertCircle, Users, Shield, ArrowRight, User, Lock } from 'lucide-react';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState(null);

  const refundCases = [
    {
      id: 1,
      title: "Ritardo Aereo",
      description: "Rimborso per voli in ritardo superiore a 3 ore. Diritto a compensazione secondo il Regolamento UE 261/2004.",
      amount: "€250 - €600",
      icon: <Clock className="case-icon case-icon-blue" />,
      details: "Compensazione automatica per ritardi superiori a 3 ore su voli europei",
      bgColor: "case-card-blue"
    },
    {
      id: 2,
      title: "Volo Cancellato",
      description: "Rimborso completo del biglietto e compensazione per voli cancellati senza preavviso adeguato.",
      amount: "€250 - €600",
      icon: <AlertCircle className="case-icon case-icon-red" />,
      details: "Rimborso totale + compensazione per cancellazioni improvvise",
      bgColor: "case-card-red"
    },
    {
      id: 3,
      title: "Overbooking",
      description: "Compensazione per passeggeri esclusi dal volo per sovraprenotazione della compagnia aerea.",
      amount: "€250 - €600",
      icon: <Users className="case-icon case-icon-orange" />,
      details: "Diritto a compensazione immediata per overbooking involontario",
      bgColor: "case-card-orange"
    },
    {
      id: 4,
      title: "Bagaglio Smarrito",
      description: "Rimborso per bagagli smarriti, danneggiati o consegnati in ritardo durante il trasporto aereo.",
      amount: "€1.000 - €1.500",
      icon: <Shield className="case-icon case-icon-purple" />,
      details: "Compensazione per danni materiali e disagi causati dalla perdita bagagli",
      bgColor: "case-card-purple"
    },
    {
      id: 5,
      title: "Perdita Coincidenza",
      description: "Rimborso per perdita di voli di coincidenza dovuta a ritardi del volo precedente.",
      amount: "€250 - €600",
      icon: <Plane className="case-icon case-icon-green" />,
      details: "Compensazione per coincidenze perse per responsabilità della compagnia",
      bgColor: "case-card-green"
    },
    {
      id: 6,
      title: "Declassamento",
      description: "Rimborso parziale per passeggeri declassati a una classe inferiore rispetto al biglietto acquistato.",
      amount: "30% - 75%",
      icon: <ArrowRight className="case-icon case-icon-indigo" />,
      details: "Rimborso percentuale del prezzo per declassamento involontario",
      bgColor: "case-card-indigo"
    }
  ];

  const handleCardClick = (cardId) => {
    setSelectedCard(selectedCard === cardId ? null : cardId);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleStartRefundRequest = () => {
    // Naviga alla pagina di richiesta rimborso (da creare in futuro)
    // Per ora reindirizza al login
    navigate('/login');
  };

  const handleContactSupport = () => {
    // Naviga alla pagina di supporto (da creare in futuro)
    alert('Funzionalità in arrivo: Contatta il Supporto');
  };

  return (
    <div className="homepage-container">
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
              onClick={handleLoginClick}
            >
              <User className="btn-icon" />
              <span>Portale Rimborsi</span>
              <Lock className="btn-icon" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h2 className="hero-title">
              Ottieni il <span className="gradient-text">rimborso</span> che meriti
            </h2>
            <p className="hero-subtitle">
              Gestiamo professionalmente le tue richieste di rimborso aereo. 
              Scopri tutti i casi in cui hai diritto a una compensazione secondo la normativa europea.
            </p>
          </div>
          
          <div className="stats-card">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number stat-blue">98%</div>
                <div className="stat-label">Successo nei rimborsi</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-indigo">€2.5M+</div>
                <div className="stat-label">Recuperati per i clienti</div>
              </div>
              <div className="stat-item">
                <div className="stat-number stat-purple">15.000+</div>
                <div className="stat-label">Casi risolti</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cases Section */}
      <section className="cases-section">
        <div className="cases-content">
          <div className="cases-header">
            <h3 className="cases-title">Casi di Rimborso Gestiti</h3>
            <p className="cases-subtitle">
              Scopri tutti i casi in cui puoi richiedere un rimborso e l'ammontare che puoi ottenere
            </p>
          </div>

          <div className="cases-grid">
            {refundCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className={`case-card ${caseItem.bgColor} ${
                  selectedCard === caseItem.id ? 'case-card-selected' : ''
                }`}
                onClick={() => handleCardClick(caseItem.id)}
              >
                <div className="case-content">
                  <div className="case-main-content">
                    <div className="case-icon-wrapper">
                      {caseItem.icon}
                    </div>
                    
                    <h4 className="case-title">{caseItem.title}</h4>
                    
                    <p className="case-description">{caseItem.description}</p>
                  </div>
                  
                  <div className="case-bottom-content">
                    <div className="amount-card">
                      <div className="amount-label">Rimborso fino a:</div>
                      <div className="amount-value">{caseItem.amount}</div>
                    </div>
                    
                    {selectedCard === caseItem.id && (
                      <div className="case-details">
                        <p className="details-text">{caseItem.details}</p>
                      </div>
                    )}
                    
                    <div className="case-hint">
                      {selectedCard === caseItem.id ? 'Clicca per chiudere' : 'Clicca per dettagli'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h3 className="cta-title">Pronto a recuperare il tuo rimborso?</h3>
          <p className="cta-subtitle">
            Il nostro team di esperti è qui per aiutarti a ottenere la compensazione che meriti
          </p>
          <div className="cta-buttons">
            <button 
              className="cta-btn-primary"
              onClick={handleStartRefundRequest}
            >
              Inizia Richiesta Rimborso
            </button>
            <button 
              className="cta-btn-secondary"
              onClick={handleContactSupport}
            >
              Contatta il Supporto
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <Plane className="plane-icon-small" />
                </div>
                <h4 className="footer-brand-name">EasyFlyRefund</h4>
              </div>
              <p className="footer-description">
                Servizio professionale per la gestione dei rimborsi aerei. 
                Recuperiamo i tuoi diritti con competenza e trasparenza.
              </p>
            </div>
            
            <div className="footer-column">
              <h5 className="footer-column-title">Servizi</h5>
              <ul className="footer-links">
                <li>Rimborsi Ritardi</li>
                <li>Cancellazioni</li>
                <li>Overbooking</li>
                <li>Bagagli Smarriti</li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h5 className="footer-column-title">Supporto</h5>
              <ul className="footer-links">
                <li>Contatti</li>
                <li>FAQ</li>
                <li>Termini di Servizio</li>
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