import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import clientiService from '../../services/clientiService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Bell, User,
  ArrowLeft, Eye, XCircle, CheckCircle2,
  Calendar, MapPin, Building2, Clock
} from 'lucide-react';
import './DettaglioClientePage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
];

const DISSERVIZIO_LABEL = {
  RITARDO_AEREO:       'Ritardo Aereo',
  VOLO_CANCELLATO:     'Volo Cancellato',
  OVERBOOKING:         'Overbooking',
  BAGAGLIO_SMARRITO:   'Bagaglio Smarrito',
  PERDITA_COINCIDENZA: 'Perdita Coincidenza',
  DECLASSAMENTO:       'Declassamento',
};

const DettaglioClientePage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();

  const [cliente, setCliente]   = useState(null);
  const [moduli, setModuli]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errore, setErrore]     = useState('');

  useEffect(() => {
    const caricaCliente = async () => {
      try {
        const risposta = await clientiService.visualizzaCliente(id);
        const codice   = risposta?.listaEsiti?.[0]?.codice;
        if (codice === 100 && risposta.cliente) {
          setCliente(risposta.cliente);
          setModuli(risposta.elencoModuliCliente ?? []);
        } else {
          setErrore(risposta?.listaEsiti?.[0]?.descrizione ?? 'Cliente non trovato.');
        }
      } catch {
        setErrore('Errore nel caricamento del cliente.');
      } finally {
        setLoading(false);
      }
    };
    caricaCliente();
  }, [id]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatoBadgeClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', APPROVATO: 'approvato', RESPINTO: 'respinto' };
    return map[codice] ?? '';
  };

  const getStatoLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', APPROVATO: 'Approvato', RESPINTO: 'Respinto' };
    return map[codice] ?? codice;
  };

  const statoCliente = cliente?.dataFine ? 'chiuso' : 'attivo';

  return (
    <div className="dc-root">

      {/* SIDEBAR */}
      <aside className="dc-sidebar">
        <div className="dc-sidebar-head">
          <div className="dc-logo">
            <div className="dc-logo-icon"><Plane size={20} /></div>
            <span className="dc-logo-txt">EasyFlyRefund</span>
          </div>
        </div>
        <nav className="dc-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`dc-nav-item ${location.pathname.startsWith(m.path) && m.path !== '/' ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="dc-nav-ico" />
              <span className="dc-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="dc-sidebar-foot">
          <button className="dc-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dc-main">

        {/* TOPBAR */}
        <header className="dc-topbar">
          <div className="dc-topbar-left">
            <h1 className="dc-topbar-title">Clienti</h1>
            <p className="dc-topbar-sub">Dettaglio cliente</p>
          </div>
          <div className="dc-topbar-right">
            <button className="dc-bell">
              <Bell size={20} />
              <span className="dc-bell-badge">3</span>
            </button>
            <div className="dc-topbar-user">
              <div className="dc-avatar"><User size={18} /></div>
              <span className="dc-user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="dc-body">

          <button className="dc-back-btn" onClick={() => navigate('/clienti')}>
            <ArrowLeft size={16} />
            <span>Torna alla lista clienti</span>
          </button>

          {loading && (
            <div className="dc-loading"><p>Caricamento in corso...</p></div>
          )}

          {errore && (
            <div className="dc-errore">
              <XCircle size={18} />
              <span>{errore}</span>
            </div>
          )}

          {!loading && !errore && cliente && (
            <>
              {/* HEADER CLIENTE */}
              <div className="dc-header-cliente">
                <div className="dc-header-info">
                  <div className="dc-avatar-grande">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="dc-cliente-nome">
                      {cliente.cognome} {cliente.nome}
                    </h2>
                    <span className="dc-cliente-cf">{cliente.codiceFiscale}</span>
                  </div>
                </div>
                <span className={`dc-badge-stato ${statoCliente}`}>
                  {statoCliente === 'attivo'
                    ? <><CheckCircle2 size={13} /> Attivo</>
                    : <><XCircle size={13} /> Chiuso</>
                  }
                </span>
              </div>

              {/* GRID DATI */}
              <div className="dc-grid">

                {/* DATI ANAGRAFICI */}
                <div className="dc-card">
                  <div className="dc-card-title">
                    <Users size={16} />
                    <span>Dati Anagrafici</span>
                  </div>
                  <div className="dc-card-body">
                    <div className="dc-field">
                      <span className="dc-field-label">Nome</span>
                      <span className="dc-field-value">{cliente.nome ?? '—'}</span>
                    </div>
                    <div className="dc-field">
                      <span className="dc-field-label">Cognome</span>
                      <span className="dc-field-value">{cliente.cognome ?? '—'}</span>
                    </div>
                    <div className="dc-field">
                      <span className="dc-field-label">Codice Fiscale</span>
                      <span className="dc-field-value dc-cf">{cliente.codiceFiscale ?? '—'}</span>
                    </div>
                    <div className="dc-field">
                      <span className="dc-field-label">Tipo Cliente</span>
                      <span className={`dc-badge-tipo ${cliente.tipoCliente?.codice === 'AGENZIA' ? 'agenzia' : 'privato'}`}>
                        {cliente.tipoCliente?.codice === 'AGENZIA' ? 'Agenzia' : 'Privato'}
                      </span>
                    </div>
                    {cliente.tipoCliente?.codice === 'AGENZIA' && (
                      <div className="dc-field">
                        <span className="dc-field-label">Nome Agenzia</span>
                        <span className="dc-field-value">{cliente.nomeAgenzia ?? '—'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* DATE */}
                <div className="dc-card">
                  <div className="dc-card-title">
                    <Calendar size={16} />
                    <span>Date</span>
                  </div>
                  <div className="dc-card-body">
                    <div className="dc-field">
                      <span className="dc-field-label">Registrazione</span>
                      <span className="dc-field-value">
                        {cliente.dataCreazione
                          ? new Date(cliente.dataCreazione).toLocaleDateString('it-IT')
                          : '—'}
                      </span>
                    </div>
                    <div className="dc-field">
                      <span className="dc-field-label">Data Chiusura</span>
                      <span className="dc-field-value">
                        {cliente.dataFine
                          ? new Date(cliente.dataFine).toLocaleDateString('it-IT')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* TABELLA MODULI */}
              <div className="dc-moduli-section">
                <div className="dc-moduli-hdr">
                  <FileText size={16} />
                  <span>Moduli Rimborso ({moduli.length})</span>
                </div>

                <div className="dc-panel">
                  {moduli.length === 0 ? (
                    <div className="dc-empty">
                      <FileText size={32} className="dc-empty-ico" />
                      <p>Nessun modulo associato a questo cliente</p>
                    </div>
                  ) : (
                    <>
                      <div className="dc-tbl-hdr">
                        <span>N. Volo</span>
                        <span>Data Volo</span>
                        <span>Tratta</span>
                        <span>Compagnia</span>
                        <span>Disservizio</span>
                        <span>Stato</span>
                        <span>Data Invio</span>
                        <span />
                      </div>

                      {moduli.map(m => {
                        const statoCodice = m.stato?.codice ?? '';
                        const disCodice   = m.disservizio?.codice ?? '';
                        return (
                          <div key={m.id} className="dc-tbl-row">
                            <span className="dc-cell-volo">{m.numeroVolo ?? '—'}</span>
                            <span className="dc-cell-data">
                              {m.dataVolo
                                ? new Date(m.dataVolo).toLocaleDateString('it-IT')
                                : '—'}
                            </span>
                            <span className="dc-cell-tratta">
                              {m.aeroportoPartenza && m.aeroportoArrivo
                                ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}`
                                : '—'}
                            </span>
                            <span className="dc-cell-compagnia">{m.compagnia ?? '—'}</span>
                            <span className="dc-cell-disservizio">
                              {DISSERVIZIO_LABEL[disCodice] ?? disCodice ?? '—'}
                            </span>
                            <span className={`dc-badge-stato-modulo ${getStatoBadgeClass(statoCodice)}`}>
                              {statoCodice === 'IN_ATTESA'  && <Clock size={12} />}
                              {statoCodice === 'APPROVATO'  && <CheckCircle2 size={12} />}
                              {statoCodice === 'RESPINTO'   && <XCircle size={12} />}
                              {getStatoLabel(statoCodice)}
                            </span>
                            <span className="dc-cell-data">
                              {m.dataInvio
                                ? new Date(m.dataInvio).toLocaleDateString('it-IT')
                                : '—'}
                            </span>
                            <span className="dc-cell-azioni">
                              <button
                                className="dc-btn-eye"
                                title="Vedi dettaglio modulo"
                                onClick={() => navigate(`/moduli/${m.id}`)}
                              >
                                <Eye size={16} />
                              </button>
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DettaglioClientePage;