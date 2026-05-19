import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clientiService from '../../services/clientiService';
import Sidebar from '../sidebar/Sidebar';
import {
  Bell, User, Users, ArrowLeft, Eye, XCircle, CheckCircle2, Calendar, Clock, FileText
} from 'lucide-react';
import './DettaglioClientePage.css';

const DettaglioClientePage = () => {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [cliente, setCliente] = useState(null);
  const [moduli, setModuli]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore]   = useState('');

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
    <div className="g-root">
      <Sidebar />
      <div className="g-main">
        <header className="g-topbar">
          <div className="g-topbar-left">
            <h1 className="g-topbar-title">Clienti</h1>
            <p className="g-topbar-sub">Dettaglio cliente</p>
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
          <button className="g-back-btn" onClick={() => navigate('/clienti')}>
            <ArrowLeft size={16} /><span>Torna alla lista clienti</span>
          </button>

          {loading && <div className="g-loading"><p>Caricamento in corso...</p></div>}
          {errore && <div className="g-errore"><XCircle size={18} /><span>{errore}</span></div>}

          {!loading && !errore && cliente && (
            <>
              <div className="dc-header-cliente">
                <div className="dc-header-info">
                  <div className="dc-avatar-grande"><User size={28} /></div>
                  <div>
                    <h2 className="dc-cliente-nome">{cliente.cognome} {cliente.nome}</h2>
                    <span className="dc-cliente-cf">{cliente.codiceFiscale}</span>
                  </div>
                </div>
                <span className={`g-badge ${statoCliente}`}>
                  {statoCliente === 'attivo' ? <><CheckCircle2 size={13} /> Attivo</> : <><XCircle size={13} /> Chiuso</>}
                </span>
              </div>

              <div className="g-grid">
                <div className="g-card">
                  <div className="g-card-title"><Users size={16} /><span>Dati Anagrafici</span></div>
                  <div className="g-card-body">
                    <div className="g-field"><span className="g-field-label">Nome</span><span className="g-field-value">{cliente.nome ?? '—'}</span></div>
                    <div className="g-field"><span className="g-field-label">Cognome</span><span className="g-field-value">{cliente.cognome ?? '—'}</span></div>
                    <div className="g-field">
                      <span className="g-field-label">Codice Fiscale</span>
                      <span className="g-field-value g-cell-mono">{cliente.codiceFiscale ?? '—'}</span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Tipo Cliente</span>
                      <span className={`g-badge ${cliente.tipoCliente?.codice === 'AGENZIA' ? 'agenzia' : 'privato'}`}>
                        {cliente.tipoCliente?.codice === 'AGENZIA' ? 'Agenzia' : 'Privato'}
                      </span>
                    </div>
                    {cliente.tipoCliente?.codice === 'AGENZIA' && (
                      <div className="g-field">
                        <span className="g-field-label">Nome Agenzia</span>
                        <span className="g-field-value">{cliente.nomeAgenzia ?? '—'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="g-card">
                  <div className="g-card-title"><Calendar size={16} /><span>Date</span></div>
                  <div className="g-card-body">
                    <div className="g-field">
                      <span className="g-field-label">Registrazione</span>
                      <span className="g-field-value">
                        {cliente.dataCreazione ? new Date(cliente.dataCreazione).toLocaleDateString('it-IT') : '—'}
                      </span>
                    </div>
                    <div className="g-field">
                      <span className="g-field-label">Data Chiusura</span>
                      <span className="g-field-value">
                        {cliente.dataFine ? new Date(cliente.dataFine).toLocaleDateString('it-IT') : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="g-section-hdr">
                <FileText size={16} />
                <span>Moduli Rimborso ({moduli.length})</span>
              </div>

              <div className="g-panel">
                {moduli.length === 0 ? (
                  <div className="g-empty">
                    <FileText size={32} className="g-empty-ico" />
                    <p>Nessun modulo associato a questo cliente</p>
                  </div>
                ) : (
                  <>
                    <div className="g-tbl-hdr dc-tbl-hdr">
                      <span>N. Volo</span><span>Data Volo</span><span>Tratta</span>
                      <span>Compagnia</span><span>Disservizio</span><span>Stato</span>
                      <span>Data Invio</span><span />
                    </div>
                    {moduli.map(m => {
                      const statoCodice = m.stato?.codice ?? '';
                      return (
                        <div key={m.id} className="g-tbl-row dc-tbl-row">
                          <span className="g-cell-mono">{m.numeroVolo ?? '—'}</span>
                          <span className="g-cell-data">
                            {m.dataVolo ? new Date(m.dataVolo).toLocaleDateString('it-IT') : '—'}
                          </span>
                          <span className="dc-cell-tratta">
                            {m.aeroportoPartenza && m.aeroportoArrivo
                              ? `${m.aeroportoPartenza} → ${m.aeroportoArrivo}` : '—'}
                          </span>
                          <span className="dc-cell-compagnia">{m.compagnia ?? '—'}</span>
                          <span className="dc-cell-disservizio">{m.disservizio?.descrizione ?? '—'}</span>
                          <span className={`g-badge ${getStatoBadgeClass(statoCodice)}`}>
                            {statoCodice === 'IN_ATTESA'  && <Clock size={12} />}
                            {statoCodice === 'APPROVATO'  && <CheckCircle2 size={12} />}
                            {statoCodice === 'RESPINTO'   && <XCircle size={12} />}
                            {getStatoLabel(statoCodice)}
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

export default DettaglioClientePage;
