import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clientiService from '../../services/clientiService.js';
import Sidebar from '../sidebar/Sidebar';
import {
  Search, Bell, User, Eye, Plus, ChevronLeft, ChevronRight, Filter, Users
} from 'lucide-react';
import './ClientiPage.css';

const PER_PAGINA = 8;

const ClientiPage = () => {
  const navigate = useNavigate();

  const [clienti, setClienti]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [errore, setErrore]           = useState('');
  const [search, setSearch]           = useState('');
  const [filtroTipo, setFiltroTipo]   = useState('tutti');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [pagina, setPagina]           = useState(1);

  useEffect(() => {
    const caricaClienti = async () => {
      try {
        const lista = await clientiService.visualizzaClienti();
        setClienti(lista);
      } catch {
        setErrore('Errore nel caricamento dei clienti.');
      } finally {
        setLoading(false);
      }
    };
    caricaClienti();
  }, []);

  const filtrati = clienti.filter(c => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      c.nome.toLowerCase().includes(s) ||
      c.cognome.toLowerCase().includes(s) ||
      c.codiceFiscale.toLowerCase().includes(s);
    const tipo  = c.tipoCliente?.codice ?? '';
    const stato = c.dataFine ? 'chiuso' : 'attivo';
    return matchSearch &&
      (filtroTipo  === 'tutti' || tipo  === filtroTipo) &&
      (filtroStato === 'tutti' || stato === filtroStato);
  });

  const totalPag = Math.max(1, Math.ceil(filtrati.length / PER_PAGINA));
  const pag      = Math.min(pagina, totalPag);
  const slice    = filtrati.slice((pag - 1) * PER_PAGINA, pag * PER_PAGINA);

  const reset  = () => { setSearch(''); setFiltroTipo('tutti'); setFiltroStato('tutti'); setPagina(1); };
  const goPage = (n) => { if (n >= 1 && n <= totalPag) setPagina(n); };
  const genPagine = () => {
    if (totalPag <= 5) return Array.from({ length: totalPag }, (_, i) => i + 1);
    const set = new Set([1, pag - 1, pag, pag + 1, totalPag]);
    return [...set].filter(n => n >= 1 && n <= totalPag).sort((a, b) => a - b);
  };
  const pagine = genPagine();

  return (
    <div className="g-root">
      <Sidebar />
      <div className="g-main">
        <header className="g-topbar">
          <div className="g-topbar-left">
            <h1 className="g-topbar-title">Clienti</h1>
            <p className="g-topbar-sub">Gestione anagrafica clienti</p>
          </div>
          <div className="g-topbar-right">
            <div className="g-topbar-search">
              <Search size={15} className="g-search-ico" />
              <input className="g-search-input" placeholder="Cerca nome, cognome, CF..."
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
              <h2 className="g-page-title">Lista Clienti</h2>
              <span className="g-page-count">
                {loading ? 'Caricamento...'
                  : `${filtrati.length} ${filtrati.length !== 1 ? 'clienti trovati' : 'cliente trovato'}`}
              </span>
            </div>
            <button className="g-btn-primary" onClick={() => navigate('/clienti/nuovo')}>
              <Plus size={17} /> Nuovo Cliente
            </button>
          </div>

          <div className="g-filtri">
            <div className="g-filtri-inner">
              <div className="g-filtro-wrap">
                <Filter size={14} className="g-filtro-ico" />
                <select className="g-filtro-sel" value={filtroTipo}
                  onChange={e => { setFiltroTipo(e.target.value); setPagina(1); }}>
                  <option value="tutti">Tutti i tipi</option>
                  <option value="PRIVATO">Privato</option>
                  <option value="AGENZIA">Agenzia</option>
                </select>
              </div>
              <div className="g-filtro-wrap">
                <select className="g-filtro-sel" value={filtroStato}
                  onChange={e => { setFiltroStato(e.target.value); setPagina(1); }}>
                  <option value="tutti">Tutti gli stati</option>
                  <option value="attivo">Attivo</option>
                  <option value="chiuso">Chiuso</option>
                </select>
              </div>
              {(filtroTipo !== 'tutti' || filtroStato !== 'tutti' || search !== '') && (
                <button className="g-reset" onClick={reset}>Resetta filtri</button>
              )}
            </div>
          </div>

          <div className="g-panel">
            <div className="g-tbl">
              <div className="g-tbl-hdr cp-tbl-hdr">
                <span>ID</span><span>Nome</span><span>Cognome</span><span>Tipo</span>
                <span>Agenzia</span><span>Stato</span>
                <span>Registrazione</span><span />
              </div>

              {loading ? (
                <div className="g-empty"><p>Caricamento in corso...</p></div>
              ) : errore ? (
                <div className="g-empty"><p>{errore}</p></div>
              ) : slice.length > 0 ? (
                slice.map(c => {
                  const stato = c.dataFine ? 'chiuso' : 'attivo';
                  const tipo  = c.tipoCliente?.codice ?? '';
                  return (
                    <div key={c.id} className="g-tbl-row cp-tbl-row">
                      <span className="g-cell-mono">{c.id}</span>
                      <span className="cp-cell-nome">{c.nome}</span>
                      <span className="cp-cell-cognome">{c.cognome}</span>
                      <span className={`g-badge ${tipo === 'AGENZIA' ? 'agenzia' : 'privato'}`}>
                        {tipo === 'AGENZIA' ? 'Agenzia' : 'Privato'}
                      </span>
                      <span className="cp-cell-agenzia">{c.nomeAgenzia || '—'}</span>
                      <span className={`g-badge ${stato}`}>
                        {stato === 'chiuso' ? 'Chiuso' : 'Attivo'}
                      </span>
                      <span className="g-cell-data">
                        {c.dataCreazione ? new Date(c.dataCreazione).toLocaleDateString('it-IT') : '—'}
                      </span>
                      <span className="g-cell-azioni">
                        <button className="g-btn-eye" title="Vedi dettaglio"
                          onClick={() => navigate(`/clienti/${c.id}`)}>
                          <Eye size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="g-empty">
                  <Users size={38} className="g-empty-ico" />
                  <p>Nessun cliente trovato con i filtri applicati</p>
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

export default ClientiPage;