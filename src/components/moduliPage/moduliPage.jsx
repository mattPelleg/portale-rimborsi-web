import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moduliService from '../../services/moduliService';
import Sidebar from '../sidebar/Sidebar';
import {
  Search, Bell, User, Eye, Plus, ChevronLeft, ChevronRight, Filter, FileText
} from 'lucide-react';
import './ModuliPage.css';

const PER_PAGINA = 8;

const ModuliPage = () => {
  const navigate = useNavigate();

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
    const matchSearch = !s || m.numeroVolo?.toLowerCase().includes(s) ||
      m.compagnia?.toLowerCase().includes(s) || nomeCliente.includes(s);
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

  const reset = () => { setSearch(''); setFiltroStato('tutti'); setFiltroDisservizio('tutti'); setPagina(1); };
  const goPage = (n) => { if (n >= 1 && n <= totalPag) setPagina(n); };
  const genPagine = () => {
    if (totalPag <= 5) return Array.from({ length: totalPag }, (_, i) => i + 1);
    const set = new Set([1, pag - 1, pag, pag + 1, totalPag]);
    return [...set].filter(n => n >= 1 && n <= totalPag).sort((a, b) => a - b);
  };
  const pagine = genPagine();

  const getStatoClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', APPROVATO: 'approvato', RESPINTO: 'respinto' };
    return map[codice] ?? '';
  };
  const getStatoLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', APPROVATO: 'Approvato', RESPINTO: 'Respinto' };
    return map[codice] ?? codice;
  };

  return (
    <div className="g-root">
      <Sidebar />
      <div className="g-main">
        <header className="g-topbar">
          <div className="g-topbar-left">
            <h1 className="g-topbar-title">Moduli Rimborso</h1>
            <p className="g-topbar-sub">Gestione moduli di rimborso</p>
          </div>
          <div className="g-topbar-right">
            <div className="g-topbar-search">
              <Search size={15} className="g-search-ico" />
              <input className="g-search-input" placeholder="Cerca volo, compagnia, cliente..."
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
              <h2 className="g-page-title">Lista Moduli</h2>
              <span className="g-page-count">
                {loading ? 'Caricamento...' : `${filtrati.length} ${filtrati.length !== 1 ? 'moduli trovati' : 'modulo trovato'}`}
              </span>
            </div>
            <button className="g-btn-primary" onClick={() => navigate('/moduli/nuovo')}>
              <Plus size={17} /> Nuovo Modulo
            </button>
          </div>

          <div className="g-filtri">
            <div className="g-filtri-inner">
              <div className="g-filtro-wrap">
                <Filter size={14} className="g-filtro-ico" />
                <select className="g-filtro-sel" value={filtroStato}
                  onChange={e => { setFiltroStato(e.target.value); setPagina(1); }}>
                  <option value="tutti">Tutti gli stati</option>
                  <option value="IN_ATTESA">In Attesa</option>
                  <option value="APPROVATO">Approvato</option>
                  <option value="RESPINTO">Respinto</option>
                </select>
              </div>
              <div className="g-filtro-wrap">
                <select className="g-filtro-sel" value={filtroDisservizio}
                  onChange={e => { setFiltroDisservizio(e.target.value); setPagina(1); }}>
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
                <button className="g-reset" onClick={reset}>Resetta filtri</button>
              )}
            </div>
          </div>

          <div className="g-panel">
            <div className="g-tbl">
              <div className="g-tbl-hdr mp-tbl-hdr">
                <span>Cliente</span><span>N. Volo</span><span>Data Volo</span><span>Tratta</span>
                <span>Compagnia</span><span>Disservizio</span><span>Stato</span><span>Data Invio</span><span />
              </div>

              {loading ? (
                <div className="g-empty"><p>Caricamento in corso...</p></div>
              ) : errore ? (
                <div className="g-empty"><p>{errore}</p></div>
              ) : slice.length > 0 ? (
                slice.map(m => {
                  const statoCodice = m.stato?.codice ?? '';
                  const nomeCliente = m.cliente
                    ? `${m.cliente.cognome ?? ''} ${m.cliente.nome ?? ''}`.trim()
                    : '—';
                  return (
                    <div key={m.id} className="g-tbl-row mp-tbl-row">
                      <span className="mp-cell-cliente">{nomeCliente}</span>
                      <span className="g-cell-mono">{m.numeroVolo ?? '—'}</span>
                      <span className="g-cell-data">
                        {m.dataVolo ? new Date(m.dataVolo).toLocaleDateString('it-IT') : '—'}
                      </span>
                      <span className="mp-cell-tratta">
                        {m.aeroportoPartenza && m.aeroportoArrivo
                          ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}` : '—'}
                      </span>
                      <span className="mp-cell-compagnia">{m.compagnia ?? '—'}</span>
                      <span className="mp-cell-disservizio">
                        {m.disservizio?.descrizione ?? '—'}
                      </span>
                      <span className={`g-badge ${getStatoClass(statoCodice)}`}>
                        {getStatoLabel(statoCodice)}
                      </span>
                      <span className="g-cell-data">
                        {m.dataInvio ? new Date(m.dataInvio).toLocaleDateString('it-IT') : '—'}
                      </span>
                      <span className="g-cell-azioni">
                        <button className="g-btn-eye" title="Vedi dettaglio"
                          onClick={() => navigate(`/moduli/${m.id}`)}>
                          <Eye size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="g-empty">
                  <FileText size={38} className="g-empty-ico" />
                  <p>Nessun modulo trovato con i filtri applicati</p>
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

export default ModuliPage;
