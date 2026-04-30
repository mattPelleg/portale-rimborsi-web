import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import moduliService from '../../services/moduliService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Search, Bell,
  User, Eye, Plus, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import './ModuliPage.css';

const PER_PAGINA = 8;

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const ModuliPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [moduli, setModuli]                       = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [errore, setErrore]                       = useState('');
  const [search, setSearch]                       = useState('');
  const [filtroStato, setFiltroStato]             = useState('tutti');
  const [filtroDisservizio, setFiltroDisservizio] = useState('tutti');
  const [pagina, setPagina]                       = useState(1);

  useEffect(() => {
    const caricaModuli = async () => {
      try {
        const risposta = await moduliService.visualizzaModuli();
        const codice   = risposta?.listaEsiti?.[0]?.codice;

        if (codice === 100 && risposta.listaModuli?.length > 0) {
          setModuli(risposta.listaModuli);
        } else {
          setModuli([]);
        }
      } catch (e) {
        setErrore('Errore nel caricamento dei moduli.');
      } finally {
        setLoading(false);
      }
    };
    caricaModuli();
  }, []);

  const filtrati = moduli.filter(m => {
    const s = search.toLowerCase();
    const nomeCliente = m.cliente
      ? `${m.cliente.cognome ?? ''} ${m.cliente.nome ?? ''}`.toLowerCase()
      : '';

    const matchSearch =
      !s ||
      m.numeroVolo?.toLowerCase().includes(s) ||
      m.compagnia?.toLowerCase().includes(s) ||
      nomeCliente.includes(s);

    const stato       = m.stato?.codice ?? '';
    const disservizio = m.disservizio?.codice ?? '';

    return (
      matchSearch &&
      (filtroStato       === 'tutti' || stato       === filtroStato) &&
      (filtroDisservizio === 'tutti' || disservizio === filtroDisservizio)
    );
  });

  const totalPag = Math.max(1, Math.ceil(filtrati.length / PER_PAGINA));
  const pag      = Math.min(pagina, totalPag);
  const slice    = filtrati.slice((pag - 1) * PER_PAGINA, pag * PER_PAGINA);

  const reset = () => {
    setSearch('');
    setFiltroStato('tutti');
    setFiltroDisservizio('tutti');
    setPagina(1);
  };

  const goPage = (n) => {
    if (n >= 1 && n <= totalPag) setPagina(n);
  };

  const genPagine = () => {
    if (totalPag <= 5) return Array.from({ length: totalPag }, (_, i) => i + 1);
    const set = new Set([1, pag - 1, pag, pag + 1, totalPag]);
    return [...set].filter(n => n >= 1 && n <= totalPag).sort((a, b) => a - b);
  };
  const pagine = genPagine();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const getStatoClass = (codice) => {
    const map = { 'IN_ATTESA': 'attesa', 'APPROVATO': 'approvato', 'RESPINTO': 'respinto' };
    return map[codice] ?? '';
  };

  const getStatoLabel = (codice) => {
    const map = { 'IN_ATTESA': 'In Attesa', 'APPROVATO': 'Approvato', 'RESPINTO': 'Respinto' };
    return map[codice] ?? codice;
  };

  const getDisservizioLabel = (codice) => {
    const map = {
      'RITARDO_AEREO':       'Ritardo Aereo',
      'VOLO_CANCELLATO':     'Volo Cancellato',
      'OVERBOOKING':         'Overbooking',
      'BAGAGLIO_SMARRITO':   'Bagaglio Smarrito',
      'PERDITA_COINCIDENZA': 'Perdita Coincidenza',
      'DECLASSAMENTO':       'Declassamento',
    };
    return map[codice] ?? codice;
  };

  return (
    <div className="mp-root">

      {/* SIDEBAR */}
      <aside className="mp-sidebar">
        <div className="mp-sidebar-head">
          <div className="mp-logo">
            <div className="mp-logo-icon"><Plane size={20} /></div>
            <span className="mp-logo-txt">EasyFlyRefund</span>
          </div>
        </div>

        <nav className="mp-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`mp-nav-item ${location.pathname === m.path ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="mp-nav-ico" />
              <span className="mp-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="mp-sidebar-foot">
          <button className="mp-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="mp-main">

        <header className="mp-topbar">
          <div className="mp-topbar-left">
            <h1 className="mp-topbar-title">Moduli Rimborso</h1>
            <p className="mp-topbar-sub">Gestione moduli di rimborso</p>
          </div>
          <div className="mp-topbar-right">
            <div className="mp-topbar-search">
              <Search size={15} className="mp-search-ico" />
              <input
                className="mp-search-input"
                placeholder="Cerca volo, compagnia, cliente..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPagina(1); }}
              />
            </div>
            <button className="mp-bell">
              <Bell size={20} />
              <span className="mp-bell-badge">3</span>
            </button>
            <div className="mp-topbar-user">
              <div className="mp-avatar"><User size={18} /></div>
              <span className="mp-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="mp-body">

          <div className="mp-page-hdr">
            <div>
              <h2 className="mp-page-title">Lista Moduli</h2>
              <span className="mp-page-count">
                {loading
                  ? 'Caricamento...'
                  : `${filtrati.length} modulo${filtrati.length !== 1 ? 'i' : ''} trovato${filtrati.length !== 1 ? 'i' : ''}`
                }
              </span>
            </div>
            <button className="mp-btn-primary" onClick={() => navigate('/moduli/nuovo')}>
              <Plus size={17} /> Nuovo Modulo
            </button>
          </div>

          <div className="mp-filtri">
            <div className="mp-filtri-inner">
              <div className="mp-filtro-wrap">
                <Filter size={14} className="mp-filtro-ico" />
                <select
                  className="mp-filtro-sel"
                  value={filtroStato}
                  onChange={e => { setFiltroStato(e.target.value); setPagina(1); }}
                >
                  <option value="tutti">Tutti gli stati</option>
                  <option value="IN_ATTESA">In Attesa</option>
                  <option value="APPROVATO">Approvato</option>
                  <option value="RESPINTO">Respinto</option>
                </select>
              </div>

              <div className="mp-filtro-wrap">
                <select
                  className="mp-filtro-sel"
                  value={filtroDisservizio}
                  onChange={e => { setFiltroDisservizio(e.target.value); setPagina(1); }}
                >
                  <option value="tutti">Tutti i disservizi</option>
                  <option value="RITARDO_AEREO">Ritardo Aereo</option>
                  <option value="VOLO_CANCELLATO">Volo Cancellato</option>
                  <option value="OVERBOOKING">Overbooking</option>
                  <option value="BAGAGLIO_SMARRITO">Bagaglio Smarrito</option>
                  <option value="PERDITA_COINCIDENZA">Perdita Coincidenza</option>
                  <option value="DECLASSAMENTO">Declassamento</option>
                </select>
              </div>

              {(filtroStato !== 'tutti' || filtroDisservizio !== 'tutti' || search !== '') && (
                <button className="mp-reset" onClick={reset}>
                  Resetta filtri
                </button>
              )}
            </div>
          </div>

          <div className="mp-panel">
            <div className="mp-tbl">

              <div className="mp-tbl-hdr">
                <span>Cliente</span>
                <span>N. Volo</span>
                <span>Data Volo</span>
                <span>Tratta</span>
                <span>Compagnia</span>
                <span>Disservizio</span>
                <span>Stato</span>
                <span>Data Invio</span>
                <span />
              </div>

              {loading ? (
                <div className="mp-empty">
                  <p>Caricamento in corso...</p>
                </div>
              ) : errore ? (
                <div className="mp-empty">
                  <p>{errore}</p>
                </div>
              ) : slice.length > 0 ? (
                slice.map(m => {
                  const statoCodice = m.stato?.codice ?? '';
                  const disCodice   = m.disservizio?.codice ?? '';
                  const nomeCliente = m.cliente
                    ? `${m.cliente.cognome ?? ''} ${m.cliente.nome ?? ''}`.trim()
                    : '—';
                  return (
                    <div key={m.id} className="mp-tbl-row">
                      <span className="mp-cell-cliente">{nomeCliente}</span>
                      <span className="mp-cell-volo">{m.numeroVolo ?? '—'}</span>
                      <span className="mp-cell-data">
                        {m.dataVolo
                          ? new Date(m.dataVolo).toLocaleDateString('it-IT')
                          : '—'}
                      </span>
                      <span className="mp-cell-tratta">
                        {m.aeroportoPartenza && m.aeroportoArrivo
                          ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}`
                          : '—'}
                      </span>
                      <span className="mp-cell-compagnia">{m.compagnia ?? '—'}</span>
                      <span className="mp-cell-disservizio">
                        {getDisservizioLabel(disCodice)}
                      </span>
                      <span className={`mp-badge-stato ${getStatoClass(statoCodice)}`}>
                        {getStatoLabel(statoCodice)}
                      </span>
                      <span className="mp-cell-data">
                        {m.dataInvio
                          ? new Date(m.dataInvio).toLocaleDateString('it-IT')
                          : '—'}
                      </span>
                      <span className="mp-cell-azioni">
                        <button className="mp-btn-eye" title="Vedi dettaglio">
                          <Eye size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="mp-empty">
                  <FileText size={38} className="mp-empty-ico" />
                  <p>Nessun modulo trovato con i filtri applicati</p>
                </div>
              )}
            </div>

            {!loading && !errore && totalPag > 1 && (
              <div className="mp-pag">
                <span className="mp-pag-info">
                  Mostro {(pag - 1) * PER_PAGINA + 1}–{Math.min(pag * PER_PAGINA, filtrati.length)} di {filtrati.length}
                </span>
                <div className="mp-pag-ctrls">
                  <button
                    className={`mp-pag-btn ${pag === 1 ? 'disabled' : ''}`}
                    onClick={() => goPage(pag - 1)}
                    disabled={pag === 1}
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {pagine.map((n, i) => (
                    <React.Fragment key={n}>
                      {i > 0 && pagine[i] - pagine[i - 1] > 1 && (
                        <span className="mp-pag-dots">...</span>
                      )}
                      <button
                        className={`mp-pag-btn mp-pag-num ${pag === n ? 'active' : ''}`}
                        onClick={() => goPage(n)}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))}

                  <button
                    className={`mp-pag-btn ${pag === totalPag ? 'disabled' : ''}`}
                    onClick={() => goPage(pag + 1)}
                    disabled={pag === totalPag}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModuliPage;