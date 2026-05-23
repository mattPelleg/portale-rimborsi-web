import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import {
  Users, FileText, ClipboardList, Clock,
  CheckCircle2, Plus, Search, Bell, ChevronRight,
  Activity, User, Eye
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import praticheService from '../../services/praticheService';
import moduliService from '../../services/moduliService';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [pratiche, setPratiche] = useState([]);
  const [moduli, setModuli] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingPratiche, setLoadingPratiche] = useState(true);
  const [loadingModuli, setLoadingModuli] = useState(true);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      setLoadingSummary(true);
      setLoadingPratiche(true);
      setLoadingModuli(true);

      const [resSummary, resPratiche, resModuli] = await Promise.all([
        dashboardService.getSummary(),
        praticheService.visualizzaPraticheRecenti(),
        moduliService.visualizzaModuliRecenti()
      ]);

      console.log('resSummary:', resSummary);
    console.log('resPratiche:', resPratiche);
    console.log('resModuli:', resModuli);

      setSummary(resSummary);
      setPratiche(resPratiche.listaPratiche || []);
      setModuli(resModuli.listaModuli || []);
    } catch (error) {
      console.error('Errore caricamento dashboard:', error);
    } finally {
      setLoadingSummary(false);
      setLoadingPratiche(false);
      setLoadingModuli(false);
    }
  };

  const stats = summary ? [
    { id: 'clienti', label: 'Clienti Totali', value: summary.numeroClienti?.toString() || '0', icon: <Users size={24} />, color: 'stat-blue' },
    { id: 'moduli', label: 'Moduli Totali', value: summary.numeroModuli?.toString() || '0', icon: <FileText size={24} />, color: 'stat-indigo' },
    { id: 'pratiche', label: 'Pratiche Totali', value: summary.numeroPratiche?.toString() || '0', icon: <ClipboardList size={24} />, color: 'stat-green' },
    { id: 'rimborso', label: 'Rimborsi Totali', value: `€${(summary.importoRimborso || 0).toFixed(2)}`, icon: <CheckCircle2 size={24} />, color: 'stat-orange' }
  ] : [];

  const getStatoClass = (stato) => {
    const classi = {
      'IN_ATTESA': 'stato-attesa',
      'APPROVATO': 'stato-approvato',
      'RESPINTO': 'stato-respinto',
      'IN_CORSO': 'stato-corso',
      'COMPLETATA': 'stato-completata',
      'CHIUSA': 'stato-chiusa'
    };
    return classi[stato] || '';
  };

  const getStatoLabel = (stato) => {
    const labels = {
      'IN_ATTESA': 'In Attesa',
      'APPROVATO': 'Approvato',
      'RESPINTO': 'Respinto',
      'IN_CORSO': 'In Corso',
      'COMPLETATA': 'Completata',
      'CHIUSA': 'Chiusa'
    };
    return labels[stato] || stato;
  };

  const formattaData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('it-IT');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Dashboard</h1>
            <p className="topbar-subtitle">Panoramica del sistema</p>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={16} className="topbar-search-icon" />
              <input type="text" placeholder="Cerca..." className="topbar-search-input" />
            </div>
            <button className="topbar-bell">
              <Bell size={20} />
              <span className="topbar-bell-badge">3</span>
            </button>
            <div className="topbar-user">
              <div className="topbar-user-avatar">
                <User size={18} />
              </div>
              <span className="topbar-user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="dashboard-body">

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="quick-action-btn quick-action-primary" onClick={() => navigate('/clienti/nuovo')}>
              <Plus size={18} />
              Nuovo Cliente
            </button>
            <button className="quick-action-btn quick-action-secondary" onClick={() => navigate('/moduli/nuovo')}>
              <Plus size={18} />
              Nuovo Modulo
            </button>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.id} className={`stat-card ${stat.color}`}>
                <div className="stat-card-header">
                  <div className="stat-card-icon">{stat.icon}</div>
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Pratiche Recenti + Moduli Recenti */}
          <div className="content-grid">

            {/* Pratiche Recenti */}
            <div className="panel pratiche-panel">
              <div className="panel-header">
                <h2 className="panel-title">Pratiche Recenti</h2>
                <button className="panel-action-btn" onClick={() => navigate('/pratiche')}>
                  Vedi tutte <ChevronRight size={14} />
                </button>
              </div>
              <div className="pratiche-table">
                <div className="pratiche-table-header">
                  <span>ID Pratica</span>
                  <span>Cliente</span>
                  <span>Tipo</span>
                  <span>Stato</span>
                  <span>Data</span>
                  <span>Importo</span>
                  <span></span>
                </div>
                {loadingPratiche ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Caricamento...
                  </div>
                ) : pratiche.length > 0 ? (
                  pratiche.map((pratica) => {
                    const statoCodice = pratica.statoPratica?.codice ?? '';
                    return (
                      <div key={pratica.id} className="pratiche-table-row">
                        <span className="pratica-id">{pratica.id}</span>
                        <span className="pratica-cliente">{pratica.cliente?.cognome} {pratica.cliente?.nome}</span>
                        <span className="pratica-tipo">{pratica.tipo || '-'}</span>
                        <span className={`pratica-stato ${getStatoClass(statoCodice)}`}>
                          {getStatoLabel(statoCodice)}
                        </span>
                        <span className="pratica-data">{formattaData(pratica.dataCreazione)}</span>
                        <span className="pratica-importo">€{(pratica.importoRimborso || 0).toFixed(2)}</span>
                        <span className="pratica-azioni">
                          <button 
                            className="pratica-btn-dettaglio" 
                            title="Vedi dettaglio"
                            onClick={() => navigate(`/pratiche/${pratica.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Nessuna pratica recente
                  </div>
                )}
              </div>
            </div>

            {/* Moduli Recenti */}
            <div className="panel moduli-panel">
              <div className="panel-header">
                <h2 className="panel-title">Moduli Recenti</h2>
                <button className="panel-action-btn" onClick={() => navigate('/moduli')}>
                  Vedi tutti <ChevronRight size={14} />
                </button>
              </div>
              <div className="moduli-table">
                <div className="moduli-table-header">
                  <span>ID Modulo</span>
                  <span>Cliente</span>
                  <span>Stato</span>
                  <span></span>
                </div>
                {loadingModuli ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Caricamento...
                  </div>
                ) : moduli.length > 0 ? (
                  moduli.map((modulo) => {
                    const statoCodice = modulo.stato?.codice ?? '';
                    return (
                      <div key={modulo.id} className="moduli-table-row">
                        <span className="modulo-id">{modulo.id}</span>
                        <span className="modulo-cliente">{modulo.cliente?.cognome} {modulo.cliente?.nome}</span>
                        <span className={`modulo-stato ${getStatoClass(statoCodice)}`}>
                          {getStatoLabel(statoCodice)}
                        </span>
                        <span className="modulo-azioni">
                          <button 
                            className="modulo-btn-dettaglio" 
                            title="Vedi dettaglio"
                            onClick={() => navigate(`/moduli/${modulo.id}`)}
                          >
                            <Eye size={16} />
                          </button>
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    Nessun modulo recente
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;