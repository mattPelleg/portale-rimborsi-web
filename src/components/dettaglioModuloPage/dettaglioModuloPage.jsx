import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import moduliService from '../../services/moduliService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Bell, User,
  ArrowLeft, CheckCircle2, XCircle, Clock,
  Calendar, MapPin, Building2, Mail, Phone,
  Home, AlignLeft, AlertTriangle
} from 'lucide-react';
import './DettaglioModuloPage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const DettaglioModuloPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id }   = useParams();

  const [modulo, setModulo]                   = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [errore, setErrore]                   = useState('');
  const [esito, setEsito]                     = useState(null);
  const [msgEsito, setMsgEsito]               = useState('');
  const [showRifiuto, setShowRifiuto]         = useState(false);
  const [motivoRespinto, setMotivoRespinto]   = useState('');
  const [erroreMotivo, setErroreMotivo]       = useState('');
  const [loadingAzione, setLoadingAzione]     = useState(false);

  useEffect(() => {
    const caricaModulo = async () => {
      try {
        const risposta = await moduliService.visualizzaModulo(id);
        const codice   = risposta?.listaEsiti?.[0]?.codice;
        if (codice === 100 && risposta.modulo) {
          setModulo(risposta.modulo);
        } else {
          setErrore(risposta?.listaEsiti?.[0]?.descrizione ?? 'Modulo non trovato.');
        }
      } catch {
        setErrore('Errore nel caricamento del modulo.');
      } finally {
        setLoading(false);
      }
    };
    caricaModulo();
  }, [id]);

  const handleApprova = async () => {
    setLoadingAzione(true); setEsito(null);
    try {
      const risposta     = await moduliService.approvaModulo(id);
      const esitoBackend = risposta?.listaEsiti?.[0];
      if (esitoBackend?.codice === 100) {
        setEsito('ok');
        setModulo(prev => ({ ...prev, stato: { codice: 'APPROVATO', descrizione: 'Approvato' } }));
      } else { setEsito('errore'); }
      setMsgEsito(esitoBackend?.descrizione ?? 'Operazione completata.');
    } catch (error) {
      setEsito('errore');
      setMsgEsito(error.response?.data?.listaEsiti?.[0]?.descrizione ?? "Errore durante l'approvazione.");
    } finally { setLoadingAzione(false); }
  };

  const handleRespingi = async () => {
    if (!motivoRespinto.trim()) { setErroreMotivo('Il motivo del rifiuto è obbligatorio.'); return; }
    setLoadingAzione(true); setEsito(null);
    try {
      const risposta     = await moduliService.respingiModulo(id, motivoRespinto.trim());
      const esitoBackend = risposta?.listaEsiti?.[0];
      if (esitoBackend?.codice === 100) {
        setEsito('ok');
        setModulo(prev => ({
          ...prev,
          stato: { codice: 'RESPINTO', descrizione: 'Respinto' },
          motivoRespinto: motivoRespinto.trim()
        }));
        setShowRifiuto(false);
      } else { setEsito('errore'); }
      setMsgEsito(esitoBackend?.descrizione ?? 'Operazione completata.');
    } catch (error) {
      setEsito('errore');
      setMsgEsito(error.response?.data?.listaEsiti?.[0]?.descrizione ?? "Errore durante il rifiuto.");
    } finally { setLoadingAzione(false); }
  };

  const handleLogout = async () => { await authService.logout(); navigate('/login'); };

  const getStatoBadgeClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', APPROVATO: 'approvato', RESPINTO: 'respinto' };
    return map[codice] ?? '';
  };
  const getStatoLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', APPROVATO: 'Approvato', RESPINTO: 'Respinto' };
    return map[codice] ?? codice;
  };

  const isInAttesa = modulo?.stato?.codice === 'IN_ATTESA';

  return (
    <div className="g-root">
      <aside className="g-sidebar">
        <div className="g-sidebar-head">
          <div className="g-logo">
            <div className="g-logo-icon"><Plane size={20} /></div>
            <span className="g-logo-txt">EasyFlyRefund</span>
          </div>
        </div>
        <nav className="g-sidebar-nav">
          {MENU.map(m => (
            <button key={m.id}
              className={`g-nav-item ${location.pathname.startsWith(m.path) && m.path !== '/' ? 'active' : ''}`}
              onClick={() => navigate(m.path)}>
              <m.Icon size={20} className="g-nav-ico" />
              <span className="g-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="g-sidebar-foot">
          <button className="g-logout" onClick={handleLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="g-main">
        <header className="g-topbar">
          <div className="g-topbar-left">
            <h1 className="g-topbar-title">Moduli Rimborso</h1>
            <p className="g-topbar-sub">Dettaglio modulo</p>
          </div>
          <div className="g-topbar-right">
            <button className="g-bell"><Bell size={20} /><span className="g-bell-badge">3</span></button>
            <div className="g-topbar-user">
              <div className="g-avatar"><User size={18} /></div>
              <span className="g-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="g-body">
          <button className="g-back-btn" onClick={() => navigate('/moduli')}>
            <ArrowLeft size={16} /><span>Torna alla lista moduli</span>
          </button>

          {loading && <div className="g-loading"><p>Caricamento in corso...</p></div>}
          {errore && <div className="g-errore"><XCircle size={18} /><span>{errore}</span></div>}

          {!loading && !errore && modulo && (
            <>
              {/* HEADER MODULO */}
              <div className="dm-header-modulo">
                <div className="dm-header-info">
                  <h2 className="dm-modulo-id">Modulo #{modulo.id}</h2>
                  <span className={`g-badge ${getStatoBadgeClass(modulo.stato?.codice)}`}>
                    {modulo.stato?.codice === 'IN_ATTESA'  && <Clock size={13} />}
                    {modulo.stato?.codice === 'APPROVATO'  && <CheckCircle2 size={13} />}
                    {modulo.stato?.codice === 'RESPINTO'   && <XCircle size={13} />}
                    {getStatoLabel(modulo.stato?.codice)}
                  </span>
                </div>
                {isInAttesa && (
                  <div className="dm-azioni">
                    <button className="dm-btn-approva" onClick={handleApprova} disabled={loadingAzione}>
                      <CheckCircle2 size={16} /><span>Approva</span>
                    </button>
                    <button className="dm-btn-respingi"
                      onClick={() => { setShowRifiuto(true); setEsito(null); }} disabled={loadingAzione}>
                      <XCircle size={16} /><span>Respingi</span>
                    </button>
                  </div>
                )}
              </div>

              {esito === 'ok'     && <div className="g-banner g-banner-ok"><CheckCircle2 size={18} /><span>{msgEsito}</span></div>}
              {esito === 'errore' && <div className="g-banner g-banner-err"><XCircle size={18} /><span>{msgEsito}</span></div>}

              {showRifiuto && isInAttesa && (
                <div className="dm-rifiuto-card">
                  <div className="dm-rifiuto-header">
                    <AlertTriangle size={18} className="dm-rifiuto-ico" />
                    <span>Motivazione del rifiuto</span>
                  </div>
                  <textarea
                    className={`dm-rifiuto-textarea ${erroreMotivo ? 'dm-textarea-err' : ''}`}
                    placeholder="Inserisci la motivazione del rifiuto..."
                    value={motivoRespinto}
                    onChange={e => { setMotivoRespinto(e.target.value); if (erroreMotivo) setErroreMotivo(''); }}
                    rows={3} disabled={loadingAzione}
                  />
                  {erroreMotivo && <span className="g-err-msg">{erroreMotivo}</span>}
                  <div className="dm-rifiuto-azioni">
                    <button className="dm-btn-annulla-rifiuto"
                      onClick={() => { setShowRifiuto(false); setMotivoRespinto(''); setErroreMotivo(''); }}
                      disabled={loadingAzione}>Annulla</button>
                    <button className="dm-btn-conferma-rifiuto" onClick={handleRespingi} disabled={loadingAzione}>
                      {loadingAzione ? 'Salvataggio...' : 'Conferma Rifiuto'}
                    </button>
                  </div>
                </div>
              )}

              {modulo.stato?.codice === 'RESPINTO' && modulo.motivoRespinto && (
                <div className="dm-motivo-respinto">
                  <AlertTriangle size={16} />
                  <div>
                    <span className="dm-motivo-label">Motivo del rifiuto</span>
                    <p className="dm-motivo-testo">{modulo.motivoRespinto}</p>
                  </div>
                </div>
              )}

              <div className="g-grid dm-grid">
                <div className="g-card">
                  <div className="g-card-title"><Users size={16} /><span>Dati Cliente</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Nome e Cognome</span>
                      <span className="g-field-value">{modulo.cliente?.cognome} {modulo.cliente?.nome}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Codice Fiscale</span>
                      <span className="g-field-value g-cell-mono">{modulo.cliente?.codiceFiscale ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Tipo Cliente</span>
                      <span className="g-field-value">
                        {modulo.cliente?.tipoCliente?.codice === 'AGENZIA'
                          ? `Agenzia — ${modulo.cliente?.nomeAgenzia}` : 'Privato'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="g-card">
                  <div className="g-card-title"><Plane size={16} /><span>Dati Volo</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Numero Volo</span>
                      <span className="g-field-value dm-volo">{modulo.numeroVolo ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <Calendar size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Data Volo</span>
                      <span className="g-field-value">
                        {modulo.dataVolo ? new Date(modulo.dataVolo).toLocaleDateString('it-IT') : '—'}
                      </span>
                    </div>
                    <div className="g-field">
                      <MapPin size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Tratta</span>
                      <span className="g-field-value">{modulo.aeroportoPartenza} → {modulo.aeroportoArrivo}</span>
                    </div>
                    <div className="g-field">
                      <Building2 size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Compagnia</span>
                      <span className="g-field-value">{modulo.compagnia ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Disservizio</span>
                      <span className="g-field-value">{modulo.disservizio?.descrizione ?? '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="g-card">
                  <div className="g-card-title"><Mail size={16} /><span>Dati di Contatto</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <Mail size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Email</span>
                      <span className="g-field-value">{modulo.email ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <Phone size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Telefono</span>
                      <span className="g-field-value">{modulo.telefono ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <Home size={14} className="g-filtro-ico" />
                      <span className="g-field-label">Indirizzo</span>
                      <span className="g-field-value">{modulo.indirizzo ?? '—'}</span>
                    </div>
                  </div>
                </div>

                {modulo.descrizione && (
                  <div className="g-card g-card-full dm-card-full">
                    <div className="g-card-title"><AlignLeft size={16} /><span>Descrizione Disservizio</span></div>
                    <div className="g-card-body">
                      <p className="dm-descrizione">{modulo.descrizione}</p>
                    </div>
                  </div>
                )}

                <div className="g-card">
                  <div className="g-card-title"><Calendar size={16} /><span>Date</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Data Invio</span>
                      <span className="g-field-value">
                        {modulo.dataInvio ? new Date(modulo.dataInvio).toLocaleString('it-IT') : '—'}
                      </span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Ultimo Aggiornamento</span>
                      <span className="g-field-value">
                        {modulo.dataAggiornamento ? new Date(modulo.dataAggiornamento).toLocaleString('it-IT') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DettaglioModuloPage;
