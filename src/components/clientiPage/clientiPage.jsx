import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Search, Bell,
  User, Eye, Plus, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import './ClientiPage.css';

/* ─── DATI FITTIZI ─────────────────────────────────────────── */
const CLIENTI = [
  { id: 1,  cf: 'RSSMRA80A01H501K', nome: 'Mario',    cognome: 'Rossi',     tipo: 'PRIVATO', agenzia: null,              pratiche: 2,  reg: '15 Gen 2025', stato: 'attivo' },
  { id: 2,  cf: 'BNCGLA90C15F205X', nome: 'Giulia',   cognome: 'Bianchi',   tipo: 'PRIVATO', agenzia: null,              pratiche: 1,  reg: '18 Gen 2025', stato: 'attivo' },
  { id: 3,  cf: 'VRDLCU85E20A048Y', nome: 'Luca',     cognome: 'Verdi',     tipo: 'PRIVATO', agenzia: null,              pratiche: 3,  reg: '02 Dic 2024', stato: 'attivo' },
  { id: 4,  cf: 'NRISRA92H12G964W', nome: 'Sara',     cognome: 'Neri',      tipo: 'PRIVATO', agenzia: null,              pratiche: 1,  reg: '22 Nov 2024', stato: 'attivo' },
  { id: 5,  cf: 'BLAPOL78D30L219Z', nome: 'Paolo',    cognome: 'Blu',       tipo: 'PRIVATO', agenzia: null,              pratiche: 2,  reg: '10 Ott 2024', stato: 'attivo' },
  { id: 6,  cf: 'RSNANN95B14E321V', nome: 'Anna',     cognome: 'Rosanna',   tipo: 'AGENZIA', agenzia: 'Viaggio & Co',    pratiche: 5,  reg: '05 Set 2024', stato: 'attivo' },
  { id: 7,  cf: 'MRCGRD70F08C205U', nome: 'Giorgio',  cognome: 'Marchi',    tipo: 'AGENZIA', agenzia: 'Sole e Mare Srl', pratiche: 8,  reg: '12 Ago 2024', stato: 'attivo' },
  { id: 8,  cf: 'FRRFRA88L25H501T', nome: 'Franco',   cognome: 'Ferrario',  tipo: 'PRIVATO', agenzia: null,              pratiche: 1,  reg: '28 Lug 2024', stato: 'attivo' },
  { id: 9,  cf: 'CSTMRC92A10G964S', nome: 'Marco',    cognome: 'Conti',     tipo: 'PRIVATO', agenzia: null,              pratiche: 0,  reg: '03 Giun 2024',stato: 'chiuso'  },
  { id: 10, cf: 'PGLELA87D22L219R', nome: 'Elena',    cognome: 'Paglioli',  tipo: 'AGENZIA', agenzia: 'TravelPoint',     pratiche: 12, reg: '19 Mag 2024', stato: 'attivo' },
  { id: 11, cf: 'TMBLUC91G18F205Q', nome: 'Luca',     cognome: 'Tomba',     tipo: 'PRIVATO', agenzia: null,              pratiche: 1,  reg: '07 Apr 2024', stato: 'attivo' },
  { id: 12, cf: 'GRNPAT83C02E321P', nome: 'Patrizia', cognome: 'Garno',     tipo: 'PRIVATO', agenzia: null,              pratiche: 2,  reg: '14 Mar 2024', stato: 'chiuso'  },
  { id: 13, cf: 'DVSGBR76B11H501O', nome: 'Roberto',  cognome: 'Davisi',    tipo: 'AGENZIA', agenzia: 'Mondo Viaggio',   pratiche: 6,  reg: '25 Feb 2024', stato: 'attivo' },
  { id: 14, cf: 'LNMMRC89E19G964N', nome: 'Marco',    cognome: 'Lenma',     tipo: 'PRIVATO', agenzia: null,              pratiche: 0,  reg: '01 Gen 2024', stato: 'chiuso'  },
];

const PER_PAGINA = 8;

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',   Icon: Settings,        path: '/impostazioni' },
];

/* ─── COMPONENTE PRINCIPALE ────────────────────────────────── */
const ClientiPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [search, setSearch]           = useState('');
  const [filtroTipo, setFiltroTipo]   = useState('tutti');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [pagina, setPagina]           = useState(1);

  /* ── filtro ── */
  const filtrati = CLIENTI.filter(c => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      c.nome.toLowerCase().includes(s) ||
      c.cognome.toLowerCase().includes(s) ||
      c.cf.toLowerCase().includes(s);

    return (
      matchSearch &&
      (filtroTipo  === 'tutti' || c.tipo  === filtroTipo) &&
      (filtroStato === 'tutti' || c.stato === filtroStato)
    );
  });

  /* ── paginazione ── */
  const totalPag = Math.max(1, Math.ceil(filtrati.length / PER_PAGINA));
  const pag      = Math.min(pagina, totalPag);
  const slice    = filtrati.slice((pag - 1) * PER_PAGINA, pag * PER_PAGINA);

  const reset  = () => {
    setSearch('');
    setFiltroTipo('tutti');
    setFiltroStato('tutti');
    setPagina(1);
  };

  const goPage = (n) => {
    if (n >= 1 && n <= totalPag) setPagina(n);
  };

  const handleLogout = async () => {
  await authService.logout();
  navigate('/login');
};

  /* genera numeri di pagina con ellissi */
  const genPagine = () => {
    if (totalPag <= 5) return Array.from({ length: totalPag }, (_, i) => i + 1);
    const set = new Set([1, pag - 1, pag, pag + 1, totalPag]);
    return [...set].filter(n => n >= 1 && n <= totalPag).sort((a, b) => a - b);
  };
  const pagine = genPagine();

  /* ── render ── */
  return (
    <div className="cp-root">

      {/* ── SIDEBAR ── */}
      <aside className="cp-sidebar">
        <div className="cp-sidebar-head">
          <div className="cp-logo">
            <div className="cp-logo-icon">
              <Plane size={20} />
            </div>
            <span className="cp-logo-txt">EasyFlyRefund</span>
          </div>
        </div>

        <nav className="cp-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`cp-nav-item ${location.pathname === m.path ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="cp-nav-ico" />
              <span className="cp-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="cp-sidebar-foot">
          <button className="cp-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="cp-main">

        {/* topbar */}
        <header className="cp-topbar">
          <div className="cp-topbar-left">
            <h1 className="cp-topbar-title">Clienti</h1>
            <p className="cp-topbar-sub">Gestione anagrafica clienti</p>
          </div>
          <div className="cp-topbar-right">
            <div className="cp-topbar-search">
              <Search size={15} className="cp-search-ico" />
              <input
                className="cp-search-input"
                placeholder="Cerca nome, cognome, CF…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPagina(1); }}
              />
            </div>
            <button className="cp-bell">
              <Bell size={20} />
              <span className="cp-bell-badge">3</span>
            </button>
            <div className="cp-topbar-user">
              <div className="cp-avatar">
                <User size={18} />
              </div>
              <span className="cp-user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* body */}
        <div className="cp-body">

          {/* header pagina: titolo + CTA */}
          <div className="cp-page-hdr">
            <div>
              <h2 className="cp-page-title">Lista Clienti</h2>
              <span className="cp-page-count">
                {filtrati.length} cliente{filtrati.length !== 1 ? 'i' : ''} trovato{filtrati.length !== 1 ? 'i' : ''}
              </span>
            </div>
            <button className="cp-btn-primary">
              <Plus size={17} /> Nuovo Cliente
            </button>
          </div>

          {/* filtri */}
          <div className="cp-filtri">
            <div className="cp-filtri-inner">
              <div className="cp-filtro-wrap">
                <Filter size={14} className="cp-filtro-ico" />
                <select
                  className="cp-filtro-sel"
                  value={filtroTipo}
                  onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}
                >
                  <option value="tutti">Tutti i tipi</option>
                  <option value="PRIVATO">Privato</option>
                  <option value="AGENZIA">Agenzia</option>
                </select>
              </div>

              <div className="cp-filtro-wrap">
                <select
                  className="cp-filtro-sel"
                  value={filtroStato}
                  onChange={e => { setFiltroStato(e.target.value); setPagina(1); }}
                >
                  <option value="tutti">Tutti gli stati</option>
                  <option value="attivo">Attivo</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </div>

              {(filtroTipo !== 'tutti' || filtroStato !== 'tutti' || search !== '') && (
                <button className="cp-reset" onClick={reset}>
                  Resetta filtri
                </button>
              )}
            </div>
          </div>

          {/* tabella */}
          <div className="cp-panel">
            <div className="cp-tbl">

              {/* header colonne */}
              <div className="cp-tbl-hdr">
                <span>Codice Fiscale</span>
                <span>Nome</span>
                <span>Cognome</span>
                <span>Tipo</span>
                <span>Agenzia</span>
                <span>Pratiche</span>
                <span>Stato</span>
                <span>Registrazione</span>
                <span />
              </div>

              {/* righe / stato vuoto */}
              {slice.length > 0 ? (
                slice.map(c => (
                  <div key={c.id} className="cp-tbl-row">
                    <span className="cp-cell-cf">{c.cf}</span>
                    <span className="cp-cell-nome">{c.nome}</span>
                    <span className="cp-cell-cognome">{c.cognome}</span>

                    <span className={`cp-badge-tipo ${c.tipo === 'AGENZIA' ? 'agenzia' : 'privato'}`}>
                      {c.tipo === 'AGENZIA' ? 'Agenzia' : 'Privato'}
                    </span>

                    <span className="cp-cell-agenzia">{c.agenzia || '—'}</span>
                    <span className="cp-cell-pratiche">{c.pratiche}</span>

                    <span className={`cp-badge-stato ${c.stato === 'chiuso' ? 'chiuso' : 'attivo'}`}>
                      {c.stato === 'chiuso' ? 'Chiuso' : 'Attivo'}
                    </span>

                    <span className="cp-cell-data">{c.reg}</span>
                    <span className="cp-cell-azioni">
                      <button className="cp-btn-eye" title="Vedi dettaglio">
                        <Eye size={16} />
                      </button>
                    </span>
                  </div>
                ))
              ) : (
                <div className="cp-empty">
                  <Users size={38} className="cp-empty-ico" />
                  <p>Nessun cliente trovato con i filtri applicati</p>
                </div>
              )}
            </div>

            {/* paginazione */}
            {totalPag > 1 && (
              <div className="cp-pag">
                <span className="cp-pag-info">
                  Mostro {(pag - 1) * PER_PAGINA + 1}–{Math.min(pag * PER_PAGINA, filtrati.length)} di {filtrati.length}
                </span>
                <div className="cp-pag-ctrls">
                  <button
                    className={`cp-pag-btn ${pag === 1 ? 'disabled' : ''}`}
                    onClick={() => goPage(pag - 1)}
                    disabled={pag === 1}
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {pagine.map((n, i) => (
                    <React.Fragment key={n}>
                      {i > 0 && pagine[i] - pagine[i - 1] > 1 && (
                        <span className="cp-pag-dots">…</span>
                      )}
                      <button
                        className={`cp-pag-btn cp-pag-num ${pag === n ? 'active' : ''}`}
                        onClick={() => goPage(n)}
                      >
                        {n}
                      </button>
                    </React.Fragment>
                  ))}

                  <button
                    className={`cp-pag-btn ${pag === totalPag ? 'disabled' : ''}`}
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

export default ClientiPage;