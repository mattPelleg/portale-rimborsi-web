import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import authService from '../../services/authService';
import praticheService from '../../services/praticheService';
import tipologicaService from '../../services/tipologicaService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Bell, User,
  ArrowLeft, Eye, XCircle, CheckCircle2,
  Calendar, Clock, Euro, AlignLeft
} from 'lucide-react';
import './DettaglioPraticaPage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const DettaglioPraticaPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { id }    = useParams();

  const [pratica, setPratica]               = useState(null);
  const [moduli, setModuli]                 = useState([]);
  const [loading, setLoading]               = useState(true);
  const [errore, setErrore]                 = useState('');
  const [statiPratica, setStatiPratica]     = useState([]);
  const [nuovoStato, setNuovoStato]         = useState('');
  const [loadingStato, setLoadingStato]     = useState(false);
  const [esitoStato, setEsitoStato]         = useState(null);
  const [msgEsitoStato, setMsgEsitoStato]   = useState('');

  useEffect(() => {
    const carica = async () => {
      try {
        const [rispostaPratica, rispostaStati] = await Promise.all([
          praticheService.visualizzaPratica(id),
          tipologicaService.getStatiPratica()
        ]);

        const codicePratica = rispostaPratica?.listaEsiti?.[0]?.codice;
        if (codicePratica === 100 && rispostaPratica.pratica) {
          setPratica(rispostaPratica.pratica);
          setModuli(rispostaPratica.elencoModuliPratica ?? []);
        } else {
          setErrore(rispostaPratica?.listaEsiti?.[0]?.descrizione ?? 'Pratica non trovata.');
        }

        const codiceStati = rispostaStati?.listaEsiti?.[0]?.codice;
        if (codiceStati === 100) {
          setStatiPratica(rispostaStati.listaTipologica ?? []);
        }

      } catch {
        setErrore('Errore nel caricamento della pratica.');
      } finally {
        setLoading(false);
      }
    };
    carica();
  }, [id]);

  const handleAggiornaStato = async () => {
    if (!nuovoStato) return;
    setLoadingStato(true);
    setEsitoStato(null);
    try {
      const risposta     = await praticheService.aggiornaStatoPratica(pratica.id, nuovoStato);
      const esitoBackend = risposta?.listaEsiti?.[0];
      if (esitoBackend?.codice === 100) {
        setEsitoStato('ok');
        setMsgEsitoStato('Stato aggiornato con successo.');
        const statoAggiornato = statiPratica.find(s => s.codice === nuovoStato);
        setPratica(prev => ({
          ...prev,
          statoPratica: statoAggiornato ?? { codice: nuovoStato, descrizione: nuovoStato }
        }));
        setNuovoStato('');
      } else {
        setEsitoStato('errore');
        setMsgEsitoStato(esitoBackend?.descrizione ?? 'Errore durante l\'aggiornamento.');
      }
    } catch {
      setEsitoStato('errore');
      setMsgEsitoStato('Errore durante l\'aggiornamento dello stato.');
    } finally {
      setLoadingStato(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatoClass = (codice) => {
    const map = {
      IN_ATTESA:  'attesa',
      IN_CORSO:   'corso',
      COMPLETATA: 'completata',
      CHIUSA:     'chiusa',
    };
    return map[codice] ?? '';
  };

  const getStatoLabel = (codice) => {
    const map = {
      IN_ATTESA:  'In Attesa',
      IN_CORSO:   'In Corso',
      COMPLETATA: 'Completata',
      CHIUSA:     'Chiusa',
    };
    return map[codice] ?? codice;
  };

  const getStatoModuloClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', APPROVATO: 'approvato', RESPINTO: 'respinto' };
    return map[codice] ?? '';
  };

  const getStatoModuloLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', APPROVATO: 'Approvato', RESPINTO: 'Respinto' };
    return map[codice] ?? codice;
  };

  const formatImporto = (importo) =>
    importo != null
      ? `€ ${Number(importo).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
      : '—';

  return (
    <div className="dp-root">

      {/* SIDEBAR */}
      <aside className="dp-sidebar">
        <div className="dp-sidebar-head">
          <div className="dp-logo">
            <div className="dp-logo-icon"><Plane size={20} /></div>
            <span className="dp-logo-txt">EasyFlyRefund</span>
          </div>
        </div>
        <nav className="dp-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`dp-nav-item ${location.pathname.startsWith(m.path) && m.path !== '/' ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="dp-nav-ico" />
              <span className="dp-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="dp-sidebar-foot">
          <button className="dp-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="dp-main">

        {/* TOPBAR */}
        <header className="dp-topbar">
          <div className="dp-topbar-left">
            <h1 className="dp-topbar-title">Pratiche</h1>
            <p className="dp-topbar-sub">Dettaglio pratica</p>
          </div>
          <div className="dp-topbar-right">
            <button className="dp-bell">
              <Bell size={20} />
              <span className="dp-bell-badge">3</span>
            </button>
            <div className="dp-topbar-user">
              <div className="dp-avatar"><User size={18} /></div>
              <span className="dp-user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* BODY */}
        <div className="dp-body">

          <button className="dp-back-btn" onClick={() => navigate('/pratiche')}>
            <ArrowLeft size={16} />
            <span>Torna alla lista pratiche</span>
          </button>

          {loading && (
            <div className="dp-loading"><p>Caricamento in corso...</p></div>
          )}

          {errore && (
            <div className="dp-errore">
              <XCircle size={18} />
              <span>{errore}</span>
            </div>
          )}

          {!loading && !errore && pratica && (
            <>
              {/* HEADER PRATICA */}
              <div className="dp-header-pratica">
                <div className="dp-header-info">
                  <div>
                    <h2 className="dp-pratica-codice">{pratica.codice}</h2>
                    <span className="dp-pratica-cliente">
                      {pratica.cliente?.cognome} {pratica.cliente?.nome}
                    </span>
                  </div>
                </div>
                <span className={`dp-badge-stato ${getStatoClass(pratica.statoPratica?.codice)}`}>
                  {pratica.statoPratica?.codice === 'IN_ATTESA'  && <Clock size={13} />}
                  {pratica.statoPratica?.codice === 'IN_CORSO'   && <Clock size={13} />}
                  {pratica.statoPratica?.codice === 'COMPLETATA' && <CheckCircle2 size={13} />}
                  {pratica.statoPratica?.codice === 'CHIUSA'     && <XCircle size={13} />}
                  {getStatoLabel(pratica.statoPratica?.codice)}
                </span>
              </div>

              {/* AGGIORNA STATO */}
              <div className="dp-aggiorna-stato-card">
                <div className="dp-aggiorna-stato-title">
                  <Clock size={16} />
                  <span>Aggiorna Stato Pratica</span>
                </div>
                <div className="dp-aggiorna-stato-body">
                  <select
                    className="dp-stato-select"
                    value={nuovoStato}
                    onChange={e => { setNuovoStato(e.target.value); setEsitoStato(null); }}
                    disabled={loadingStato}
                  >
                    <option value="">— Seleziona nuovo stato —</option>
                    {statiPratica.map(s => (
                      <option key={s.codice} value={s.codice}>{s.descrizione}</option>
                    ))}
                  </select>
                  <button
                    className="dp-btn-salva-stato"
                    onClick={handleAggiornaStato}
                    disabled={!nuovoStato || loadingStato}
                  >
                    {loadingStato ? 'Salvataggio...' : 'Salva'}
                  </button>
                </div>
                {esitoStato === 'ok' && (
                  <div className="dp-banner dp-banner-ok">
                    <CheckCircle2 size={16} />
                    <span>{msgEsitoStato}</span>
                  </div>
                )}
                {esitoStato === 'errore' && (
                  <div className="dp-banner dp-banner-err">
                    <XCircle size={16} />
                    <span>{msgEsitoStato}</span>
                  </div>
                )}
              </div>

              {/* GRID DATI */}
              <div className="dp-grid">

                {/* DATI CLIENTE */}
                <div className="dp-card">
                  <div className="dp-card-title">
                    <Users size={16} />
                    <span>Cliente</span>
                  </div>
                  <div className="dp-card-body">
                    <div className="dp-field">
                      <span className="dp-field-label">Nome e Cognome</span>
                      <span className="dp-field-value">
                        {pratica.cliente?.cognome} {pratica.cliente?.nome}
                      </span>
                    </div>
                    <div className="dp-field">
                      <span className="dp-field-label">Codice Fiscale</span>
                      <span className="dp-field-value dp-cf">
                        {pratica.cliente?.codiceFiscale ?? '—'}
                      </span>
                    </div>
                    <div className="dp-field">
                      <span className="dp-field-label">Dettaglio</span>
                      <button
                        className="dp-link-btn"
                        onClick={() => navigate(`/clienti/${pratica.cliente?.id}`)}
                      >
                        Vai al cliente →
                      </button>
                    </div>
                  </div>
                </div>

                {/* DATI ECONOMICI */}
                <div className="dp-card">
                  <div className="dp-card-title">
                    <Euro size={16} />
                    <span>Dati Economici</span>
                  </div>
                  <div className="dp-card-body">
                    <div className="dp-field">
                      <span className="dp-field-label">Importo Rimborso</span>
                      <span className="dp-field-value dp-importo">
                        {formatImporto(pratica.importoRimborso)}
                      </span>
                    </div>
                    <div className="dp-field">
                      <span className="dp-field-label">Importo Compensato</span>
                      <span className="dp-field-value dp-importo">
                        {formatImporto(pratica.importoCompensato)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DATE */}
                <div className="dp-card">
                  <div className="dp-card-title">
                    <Calendar size={16} />
                    <span>Date</span>
                  </div>
                  <div className="dp-card-body">
                    <div className="dp-field">
                      <span className="dp-field-label">Data Creazione</span>
                      <span className="dp-field-value">
                        {pratica.dataCreazione
                          ? new Date(pratica.dataCreazione).toLocaleString('it-IT')
                          : '—'}
                      </span>
                    </div>
                    <div className="dp-field">
                      <span className="dp-field-label">Ultimo Aggiornamento</span>
                      <span className="dp-field-value">
                        {pratica.dataAggiornamento
                          ? new Date(pratica.dataAggiornamento).toLocaleString('it-IT')
                          : '—'}
                      </span>
                    </div>
                    <div className="dp-field">
                      <span className="dp-field-label">Data Chiusura</span>
                      <span className="dp-field-value">
                        {pratica.dataChiusura
                          ? new Date(pratica.dataChiusura).toLocaleString('it-IT')
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* NOTE */}
                {pratica.nota && (
                  <div className="dp-card">
                    <div className="dp-card-title">
                      <AlignLeft size={16} />
                      <span>Note</span>
                    </div>
                    <div className="dp-card-body">
                      <p className="dp-nota">{pratica.nota}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* TABELLA MODULI */}
              <div className="dp-moduli-section">
                <div className="dp-moduli-hdr">
                  <FileText size={16} />
                  <span>Moduli collegati ({moduli.length})</span>
                </div>

                <div className="dp-panel">
                  {moduli.length === 0 ? (
                    <div className="dp-empty">
                      <FileText size={32} className="dp-empty-ico" />
                      <p>Nessun modulo collegato a questa pratica</p>
                    </div>
                  ) : (
                    <>
                      <div className="dp-tbl-hdr">
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
                        return (
                          <div key={m.id} className="dp-tbl-row">
                            <span className="dp-cell-volo">{m.numeroVolo ?? '—'}</span>
                            <span className="dp-cell-data">
                              {m.dataVolo
                                ? new Date(m.dataVolo).toLocaleDateString('it-IT')
                                : '—'}
                            </span>
                            <span className="dp-cell-tratta">
                              {m.aeroportoPartenza && m.aeroportoArrivo
                                ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}`
                                : '—'}
                            </span>
                            <span className="dp-cell-compagnia">{m.compagnia ?? '—'}</span>
                            <span className="dp-cell-disservizio">
                              {m.disservizio?.descrizione ?? '—'}
                            </span>
                            <span className={`dp-badge-stato-modulo ${getStatoModuloClass(statoCodice)}`}>
                              {getStatoModuloLabel(statoCodice)}
                            </span>
                            <span className="dp-cell-data">
                              {m.dataInvio
                                ? new Date(m.dataInvio).toLocaleDateString('it-IT')
                                : '—'}
                            </span>
                            <span className="dp-cell-azioni">
                              <button
                                className="dp-btn-eye"
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

export default DettaglioPraticaPage;