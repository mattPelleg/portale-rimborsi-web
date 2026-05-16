import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import praticheService from '../../services/praticheService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Search, Bell,
  User, Eye, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import './PratichePage.css';

const PER_PAGINA = 8;

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const PratichePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pratiche, setPratiche]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [errore, setErrore]           = useState('');
  const [search, setSearch]           = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [pagina, setPagina]           = useState(1);

  useEffect(() => {
    const caricaPratiche = async () => {
      try {
        const risposta = await praticheService.visualizzaPratiche();
        const codice   = risposta?.listaEsiti?.[0]?.codice;
        if (codice === 100 && risposta.listaPratiche?.length > 0) {
          setPratiche(risposta.listaPratiche);
        } else {
          setPratiche([]);
        }
      } catch {
        setErrore('Errore nel caricamento delle pratiche.');
      } finally {
        setLoading(false);
      }
    };
    caricaPratiche();
  }, []);

  const filtrati = pratiche.filter(p => {
    const s = search.toLowerCase();
    const nomeCliente = p.cliente
      ? `${p.cliente.cognome ?? ''} ${p.cliente.nome ?? ''}`.toLowerCase()
      : '';
    const matchSearch = !s || p.codice?.toLowerCase().includes(s) || nomeCliente.includes(s);
    const stato = p.statoPratica?.codice ?? '';
    return matchSearch && (filtroStato === 'tutti' || stato === filtroStato);
  });

  const totalPag = Math.max(1, Math.ceil(filtrati.length / PER_PAGINA));
  const pag      = Math.min(pagina, totalPag);
  const slice    = filtrati.slice((pag - 1) * PER_PAGINA, pag * PER_PAGINA);

  const reset = () => { setSearch(''); setFiltroStato('tutti'); setPagina(1); };
  const goPage = (n) => { if (n >= 1 && n <= totalPag) setPagina(n); };
  const genPagine = () => {
    if (totalPag <= 5) return Array.from({ length: totalPag }, (_, i) => i + 1);
    const set = new Set([1, pag - 1, pag, pag + 1, totalPag]);
    return [...set].filter(n => n >= 1 && n <= totalPag).sort((a, b) => a - b);
  };
  const pagine = genPagine();
  const handleLogout = async () => { await authService.logout(); navigate('/login'); };

  const getStatoClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', IN_CORSO: 'corso', COMPLETATA: 'completata', CHIUSA: 'chiusa' };
    return map[codice] ?? '';
  };
  const getStatoLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', IN_CORSO: 'In Corso', COMPLETATA: 'Completata', CHIUSA: 'Chiusa' };
    return map[codice] ?? codice;
  };
  const formatImporto = (importo) =>
    importo != null ? `€ ${Number(importo).toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '—';

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
            <h1 className="g-topbar-title">Pratiche</h1>
            <p className="g-topbar-sub">Gestione pratiche rimborso</p>
          </div>
          <div className="g-topbar-right">
            <div className="g-topbar-search">
              <Search size={15} className="g-search-ico" />
              <input className="g-search-input" placeholder="Cerca codice, cliente..."
                value={search} onChange={e => { setSearch(e.target.value); setPagina(1); }} />
            </div>
            <button className="g-bell"><Bell size={20} /><span className="g-bell-badge">3</span></button>
            <div className="g-topbar-user">
              <div className="g-avatar"><User size={18} /></div>
              <span className="g-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="g-body">
          <div className="g-page-hdr">
            <div>
              <h2 className="g-page-title">Lista Pratiche</h2>
              <span className="g-page-count">
                {loading ? 'Caricamento...' : `${filtrati.length} ${filtrati.length !== 1 ? 'pratiche trovate' : 'pratica trovata'}`}
              </span>
            </div>
          </div>

          <div className="g-filtri">
            <div className="g-filtri-inner">
              <div className="g-filtro-wrap">
                <Filter size={14} className="g-filtro-ico" />
                <select className="g-filtro-sel" value={filtroStato}
                  onChange={e => { setFiltroStato(e.target.value); setPagina(1); }}>
                  <option value="tutti">Tutti gli stati</option>
                  <option value="IN_ATTESA">In Attesa</option>
                  <option value="IN_CORSO">In Corso</option>
                  <option value="COMPLETATA">Completata</option>
                  <option value="CHIUSA">Chiusa</option>
                </select>
              </div>
              {(filtroStato !== 'tutti' || search !== '') && (
                <button className="g-reset" onClick={reset}>Resetta filtri</button>
              )}
            </div>
          </div>

          <div className="g-panel">
            <div className="g-tbl">
              <div className="g-tbl-hdr pp-tbl-hdr">
                <span>Codice</span><span>Cliente</span><span>Stato</span>
                <span>Importo Rimborso</span><span>Importo Compensato</span>
                <span>Data Creazione</span><span>Data Chiusura</span><span />
              </div>

              {loading ? (
                <div className="g-empty"><p>Caricamento in corso...</p></div>
              ) : errore ? (
                <div className="g-empty"><p>{errore}</p></div>
              ) : slice.length > 0 ? (
                slice.map(p => {
                  const statoCodice = p.statoPratica?.codice ?? '';
                  const nomeCliente = p.cliente
                    ? `${p.cliente.cognome ?? ''} ${p.cliente.nome ?? ''}`.trim()
                    : '—';
                  return (
                    <div key={p.id} className="g-tbl-row pp-tbl-row">
                      <span className="pp-cell-codice">{p.codice ?? '—'}</span>
                      <span className="pp-cell-cliente">{nomeCliente}</span>
                      <span className={`g-badge ${getStatoClass(statoCodice)}`}>
                        {getStatoLabel(statoCodice)}
                      </span>
                      <span className="pp-cell-importo">{formatImporto(p.importoRimborso)}</span>
                      <span className="pp-cell-importo">{formatImporto(p.importoCompensato)}</span>
                      <span className="g-cell-data">
                        {p.dataCreazione ? new Date(p.dataCreazione).toLocaleDateString('it-IT') : '—'}
                      </span>
                      <span className="g-cell-data">
                        {p.dataChiusura ? new Date(p.dataChiusura).toLocaleDateString('it-IT') : '—'}
                      </span>
                      <span className="g-cell-azioni">
                        <button className="g-btn-eye" title="Vedi dettaglio"
                          onClick={() => navigate(`/pratiche/${p.id}`)}>
                          <Eye size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="g-empty">
                  <ClipboardList size={38} className="g-empty-ico" />
                  <p>Nessuna pratica trovata con i filtri applicati</p>
                </div>
              )}
            </div>
            {!loading && !errore && totalPag > 1 && (
              <div className="g-pag">
                <span className="g-pag-info">
                  Mostro {(pag - 1) * PER_PAGINA + 1}–{Math.min(pag * PER_PAGINA, filtrati.length)} di {filtrati.length}
                </span>
                <div className="g-pag-ctrls">
                  <button className={`g-pag-btn ${pag === 1 ? 'disabled' : ''}`}
                    onClick={() => goPage(pag - 1)} disabled={pag === 1}>
                    <ChevronLeft size={15} />
                  </button>
                  {pagine.map((n, i) => (
                    <React.Fragment key={n}>
                      {i > 0 && pagine[i] - pagine[i - 1] > 1 && <span className="g-pag-dots">...</span>}
                      <button className={`g-pag-btn ${pag === n ? 'active' : ''}`}
                        onClick={() => goPage(n)}>{n}</button>
                    </React.Fragment>
                  ))}
                  <button className={`g-pag-btn ${pag === totalPag ? 'disabled' : ''}`}
                    onClick={() => goPage(pag + 1)} disabled={pag === totalPag}>
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

export default PratichePage;
