import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import praticheService from '../../services/praticheService';
import tipologicaService from '../../services/tipologicaService';
import Sidebar from '../sidebar/Sidebar';
import {
  Bell, User, Users, ArrowLeft, Eye, XCircle, CheckCircle2,
  Calendar, Clock, Euro, AlignLeft, FileText
} from 'lucide-react';
import './DettaglioPraticaPage.css';

const DettaglioPraticaPage = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [pratica, setPratica]             = useState(null);
  const [moduli, setModuli]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [errore, setErrore]               = useState('');
  const [statiPratica, setStatiPratica]   = useState([]);
  const [nuovoStato, setNuovoStato]       = useState('');
  const [loadingStato, setLoadingStato]   = useState(false);
  const [esitoStato, setEsitoStato]       = useState(null);
  const [msgEsitoStato, setMsgEsitoStato] = useState('');

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
    setLoadingStato(true); setEsitoStato(null);
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
        setMsgEsitoStato(esitoBackend?.descrizione ?? "Errore durante l'aggiornamento.");
      }
    } catch {
      setEsitoStato('errore');
      setMsgEsitoStato("Errore durante l'aggiornamento dello stato.");
    } finally { setLoadingStato(false); }
  };

  const getStatoClass = (codice) => {
    const map = { IN_ATTESA: 'attesa', IN_CORSO: 'corso', COMPLETATA: 'completata', CHIUSA: 'chiusa' };
    return map[codice] ?? '';
  };
  const getStatoLabel = (codice) => {
    const map = { IN_ATTESA: 'In Attesa', IN_CORSO: 'In Corso', COMPLETATA: 'Completata', CHIUSA: 'Chiusa' };
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
    <div className="g-root">
      <Sidebar />
      <div className="g-main">

        <header className="g-topbar">
          <div className="g-topbar-left">
            <h1 className="g-topbar-title">Pratiche</h1>
            <p className="g-topbar-sub">Dettaglio pratica</p>
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

          <button className="g-back-btn" onClick={() => navigate('/pratiche')}>
            <ArrowLeft size={16} /><span>Torna alla lista pratiche</span>
          </button>

          {loading && <div className="g-loading"><p>Caricamento in corso...</p></div>}
          {errore  && <div className="g-errore"><XCircle size={18} /><span>{errore}</span></div>}

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
                <span className={`g-badge ${getStatoClass(pratica.statoPratica?.codice)}`}>
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
                  <Clock size={16} /><span>Aggiorna Stato Pratica</span>
                </div>
                <div className="dp-aggiorna-stato-body">
                  <select className="dp-stato-select" value={nuovoStato}
                    onChange={e => { setNuovoStato(e.target.value); setEsitoStato(null); }}
                    disabled={loadingStato}>
                    <option value="">— Seleziona nuovo stato —</option>
                    {statiPratica.map(s => (
                      <option key={s.codice} value={s.codice}>{s.descrizione}</option>
                    ))}
                  </select>
                  <button className="dp-btn-salva-stato" onClick={handleAggiornaStato}
                    disabled={!nuovoStato || loadingStato}>
                    {loadingStato ? 'Salvataggio...' : 'Salva'}
                  </button>
                </div>
                {esitoStato === 'ok' && (
                  <div className="dp-banner dp-banner-ok">
                    <CheckCircle2 size={16} /><span>{msgEsitoStato}</span>
                  </div>
                )}
                {esitoStato === 'errore' && (
                  <div className="dp-banner dp-banner-err">
                    <XCircle size={16} /><span>{msgEsitoStato}</span>
                  </div>
                )}
              </div>

              {/* GRID DATI */}
              <div className="g-grid">

                <div className="g-card">
                  <div className="g-card-title"><Users size={16} /><span>Cliente</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Nome e Cognome</span>
                      <span className="g-field-value">{pratica.cliente?.cognome} {pratica.cliente?.nome}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Codice Fiscale</span>
                      <span className="g-field-value g-cell-mono">{pratica.cliente?.codiceFiscale ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Dettaglio</span>
                      <button className="g-link-btn"
                        onClick={() => navigate(`/clienti/${pratica.cliente?.id}`)}>
                        Vai al cliente →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="g-card">
                  <div className="g-card-title"><Euro size={16} /><span>Dati Economici</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Importo Rimborso</span>
                      <span className="g-field-value dp-importo">{formatImporto(pratica.importoRimborso)}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Importo Compensato</span>
                      <span className="g-field-value dp-importo">{formatImporto(pratica.importoCompensato)}</span>
                    </div>
                  </div>
                </div>

                <div className="g-card">
                  <div className="g-card-title"><Calendar size={16} /><span>Date</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Data Creazione</span>
                      <span className="g-field-value">
                        {pratica.dataCreazione ? new Date(pratica.dataCreazione).toLocaleString('it-IT') : '—'}
                      </span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Ultimo Aggiornamento</span>
                      <span className="g-field-value">
                        {pratica.dataAggiornamento ? new Date(pratica.dataAggiornamento).toLocaleString('it-IT') : '—'}
                      </span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Data Chiusura</span>
                      <span className="g-field-value">
                        {pratica.dataChiusura ? new Date(pratica.dataChiusura).toLocaleString('it-IT') : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {pratica.nota && (
                  <div className="g-card">
                    <div className="g-card-title"><AlignLeft size={16} /><span>Note</span></div>
                    <div className="g-card-body">
                      <p className="dp-nota">{pratica.nota}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* TABELLA MODULI */}
              <div className="g-section-hdr">
                <FileText size={16} />
                <span>Moduli collegati ({moduli.length})</span>
              </div>

              <div className="g-panel">
                {moduli.length === 0 ? (
                  <div className="g-empty">
                    <FileText size={32} className="g-empty-ico" />
                    <p>Nessun modulo collegato a questa pratica</p>
                  </div>
                ) : (
                  <>
                    <div className="g-tbl-hdr dp-tbl-hdr">
                      <span>N. Volo</span><span>Data Volo</span><span>Tratta</span>
                      <span>Compagnia</span><span>Disservizio</span><span>Stato</span>
                      <span>Data Invio</span><span />
                    </div>
                    {moduli.map(m => {
                      const statoCodice = m.stato?.codice ?? '';
                      return (
                        <div key={m.id} className="g-tbl-row dp-tbl-row">
                          <span className="g-cell-mono">{m.numeroVolo ?? '—'}</span>
                          <span className="g-cell-data">
                            {m.dataVolo ? new Date(m.dataVolo).toLocaleDateString('it-IT') : '—'}
                          </span>
                          <span className="dp-cell-tratta">
                            {m.aeroportoPartenza && m.aeroportoArrivo
                              ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}` : '—'}
                          </span>
                          <span className="dp-cell-compagnia">{m.compagnia ?? '—'}</span>
                          <span className="dp-cell-disservizio">{m.disservizio?.descrizione ?? '—'}</span>
                          <span className={`g-badge ${getStatoModuloClass(statoCodice)}`}>
                            {getStatoModuloLabel(statoCodice)}
                          </span>
                          <span className="g-cell-data">
                            {m.dataInvio ? new Date(m.dataInvio).toLocaleDateString('it-IT') : '—'}
                          </span>
                          <span className="g-cell-azioni">
                            <button className="g-btn-eye" title="Vedi dettaglio modulo"
                              onClick={() => navigate(`/moduli/${m.id}`)}>
                              <Eye size={16} />
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DettaglioPraticaPage;