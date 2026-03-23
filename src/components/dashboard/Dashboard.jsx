import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
  Plane,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Activity,
  User,
  Eye
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dati fittizi per l'esempio
  const stats = [
    { id: 'clienti', label: 'Clienti Totali', value: '1.248', icon: <Users size={24} />, trend: '+12%', trendUp: true, color: 'stat-blue' },
    { id: 'pratiche', label: 'Pratiche in Corso', value: '84', icon: <ClipboardList size={24} />, trend: '+5%', trendUp: true, color: 'stat-indigo' },
    { id: 'completate', label: 'Pratiche Completate', value: '956', icon: <CheckCircle2 size={24} />, trend: '+8%', trendUp: true, color: 'stat-green' },
    { id: 'attesa', label: 'Moduli in Attesa', value: '23', icon: <Clock size={24} />, trend: '-3%', trendUp: false, color: 'stat-orange' }
  ];

  const pratiche = [
    { id: 'PR-2025-001', cliente: 'Mario Rossi', tipo: 'Ritardo Aereo', stato: 'in-corso', data: '28 Gen 2025', importo: '€350' },
    { id: 'PR-2025-002', cliente: 'Giulia Bianchi', tipo: 'Volo Cancellato', stato: 'in-attesa', data: '27 Gen 2025', importo: '€600' },
    { id: 'PR-2025-003', cliente: 'Luca Verdi', tipo: 'Bagaglio Smarrito', stato: 'completata', data: '25 Gen 2025', importo: '€1.200' },
    { id: 'PR-2025-004', cliente: 'Sara Neri', tipo: 'Overbooking', stato: 'in-corso', data: '24 Gen 2025', importo: '€250' },
    { id: 'PR-2025-005', cliente: 'Paolo Blu', tipo: 'Perdita Coincidenza', stato: 'chiusa', data: '22 Gen 2025', importo: '€400' },
    { id: 'PR-2025-006', cliente: 'Anna Rosa', tipo: 'Declassamento', stato: 'in-attesa', data: '20 Gen 2025', importo: '€180' }
  ];

  const attivitaRecenti = [
    { id: 1, tipo: 'nuovo-cliente', descrizione: 'Nuovo cliente registrato: Mario Rossi', ora: '2 ore fa', icona: <User size={16} />, colore: 'attivita-blue' },
    { id: 2, tipo: 'stato-aggiornato', descrizione: 'Pratica PR-2025-003 completata', ora: '4 ore fa', icona: <CheckCircle2 size={16} />, colore: 'attivita-green' },
    { id: 3, tipo: 'nuovo-modulo', descrizione: 'Nuovo modulo rimborso: Giulia Bianchi', ora: '6 ore fa', icona: <FileText size={16} />, colore: 'attivita-indigo' },
    { id: 4, tipo: 'stato-aggiornato', descrizione: 'Pratica PR-2025-004 in corso', ora: '1 giorno fa', icona: <Activity size={16} />, colore: 'attivita-orange' },
    { id: 5, tipo: 'nuovo-cliente', descrizione: 'Nuovo cliente registrato: Paolo Blu', ora: '2 giorni fa', icona: <User size={16} />, colore: 'attivita-blue' }
  ];

  const menuItems = [
    { id: 'dashboard',    label: 'Dashboard',       icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'clienti',      label: 'Clienti',         icon: <Users size={20} />,           path: '/clienti' },
    { id: 'moduli',       label: 'Moduli Rimborso', icon: <FileText size={20} />,        path: '/moduli' },
    { id: 'pratiche',     label: 'Pratiche',        icon: <ClipboardList size={20} />,   path: '/pratiche' },
    { id: 'impostazioni', label: 'Impostazioni',   icon: <Settings size={20} />,         path: '/impostazioni' },
  ];

  const getStatoClass = (stato) => {
    const classi = {
      'in-attesa': 'stato-attesa',
      'in-corso': 'stato-corso',
      'completata': 'stato-completata',
      'chiusa': 'stato-chiusa'
    };
    return classi[stato] || '';
  };

  const getStatoLabel = (stato) => {
    const labels = {
      'in-attesa': 'In Attesa',
      'in-corso': 'In Corso',
      'completata': 'Completata',
      'chiusa': 'Chiusa'
    };
    return labels[stato] || stato;
  };

  const handleLogout = async () => {
  await authService.logout();
  navigate('/login');
};

  return (
    <div className="dashboard-container">

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Plane size={20} />
            </div>
            <span className="sidebar-logo-text">EasyFlyRefund</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">

        {/* Top Bar */}
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
          <button className="quick-action-btn quick-action-secondary">
            <Plus size={18} />
            Nova Pratica
          </button>
        </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.id} className={`stat-card ${stat.color}`}>
                <div className="stat-card-header">
                  <div className="stat-card-icon">{stat.icon}</div>
                  <span className={`stat-card-trend ${stat.trendUp ? 'trend-up' : 'trend-down'}`}>
                    <TrendingUp size={14} />
                    {stat.trend}
                  </span>
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Pratiche + Attività */}
          <div className="content-grid">

            {/* Pratiche Recenti */}
            <div className="panel pratiche-panel">
              <div className="panel-header">
                <h2 className="panel-title">Pratiche Recenti</h2>
                <button className="panel-action-btn">Vedi tutte <ChevronRight size={14} /></button>
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
                {pratiche.map((pratica) => (
                  <div key={pratica.id} className="pratiche-table-row">
                    <span className="pratica-id">{pratica.id}</span>
                    <span className="pratica-cliente">{pratica.cliente}</span>
                    <span className="pratica-tipo">{pratica.tipo}</span>
                    <span className={`pratica-stato ${getStatoClass(pratica.stato)}`}>
                      {getStatoLabel(pratica.stato)}
                    </span>
                    <span className="pratica-data">{pratica.data}</span>
                    <span className="pratica-importo">{pratica.importo}</span>
                    <span className="pratica-azioni">
                      <button className="pratica-btn-dettaglio" title="Vedi dettaglio">
                        <Eye size={16} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attività Recente */}
            <div className="panel attivita-panel">
              <div className="panel-header">
                <h2 className="panel-title">Attività Recente</h2>
                <button className="panel-action-btn">Tutto il log <ChevronRight size={14} /></button>
              </div>
              <div className="attivita-list">
                {attivitaRecenti.map((attivita) => (
                  <div key={attivita.id} className="attivita-item">
                    <div className={`attivita-icon ${attivita.colore}`}>
                      {attivita.icona}
                    </div>
                    <div className="attivita-content">
                      <p className="attivita-descrizione">{attivita.descrizione}</p>
                      <span className="attivita-ora">{attivita.ora}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;