import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import clientiService from '../../services/clientiService';
import moduliService from '../../services/moduliService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Bell, User,
  ArrowLeft, Save, CheckCircle2, XCircle, Search
} from 'lucide-react';
import './InserisciModuloPage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const INITIAL_FORM = {
  cognomeRicerca: '', numeroVolo: '', dataVolo: '', aeroportoPartenza: '',
  aeroportoArrivo: '', compagnia: '', disservizio: '', email: '',
  telefono: '', indirizzo: '', descrizione: '',
};

const InserisciModuloPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm]         = useState(INITIAL_FORM);
  const [errors, setErrors]     = useState({});
  const [isLoading, setLoading] = useState(false);
  const [esito, setEsito]       = useState(null);
  const [msgEsito, setMsgEsito] = useState('');

  const [clienteTrovato, setClienteTrovato]     = useState(null);
  const [cercandoCliente, setCercandoCliente]   = useState(false);
  const [risultatiRicerca, setRisultatiRicerca] = useState([]);
  const [dropdownAperto, setDropdownAperto]     = useState(false);
  const [erroreCliente, setErroreCliente]       = useState('');

  const searchWrapRef   = useRef(null);
  const selezionandoRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setDropdownAperto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selezionandoRef.current) { selezionandoRef.current = false; return; }
    const cognome = form.cognomeRicerca.trim();
    setRisultatiRicerca([]); setDropdownAperto(false); setErroreCliente('');
    if (!cognome) return;
    setClienteTrovato(null); setCercandoCliente(true);
    const timer = setTimeout(async () => {
      try {
        const risposta = await clientiService.cercaCliente(cognome);
        const codice   = risposta?.listaEsiti?.[0]?.codice;
        if (codice === 100 && risposta.listaClienti?.length > 0) {
          setRisultatiRicerca(risposta.listaClienti); setDropdownAperto(true); setErroreCliente('');
        } else {
          setRisultatiRicerca([]); setErroreCliente('Nessun cliente attivo trovato con questo cognome.');
        }
      } catch {
        setRisultatiRicerca([]); setErroreCliente('Errore durante la ricerca del cliente.');
      } finally { setCercandoCliente(false); }
    }, 400);
    return () => { clearTimeout(timer); setCercandoCliente(false); };
  }, [form.cognomeRicerca]);

  const handleSelezionaCliente = (cliente) => {
    selezionandoRef.current = true;
    setClienteTrovato(cliente);
    setForm(prev => ({ ...prev, cognomeRicerca: `${cliente.cognome} ${cliente.nome}` }));
    setRisultatiRicerca([]); setDropdownAperto(false); setErroreCliente('');
    if (errors.cognomeRicerca) setErrors(prev => ({ ...prev, cognomeRicerca: '' }));
  };

  const handleDeselezionaCliente = () => {
    setClienteTrovato(null);
    setForm(prev => ({ ...prev, cognomeRicerca: '' }));
    setRisultatiRicerca([]); setErroreCliente('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (esito) setEsito(null);
  };

  const validate = () => {
    const e = {};
    if (!clienteTrovato) e.cognomeRicerca = 'Devi selezionare un cliente dalla lista';
    if (!form.disservizio) e.disservizio = 'Il tipo di disservizio e obbligatorio';
    if (!form.numeroVolo.trim()) e.numeroVolo = 'Il numero volo e obbligatorio';
    if (!form.dataVolo) e.dataVolo = 'La data del volo e obbligatoria';
    if (!form.aeroportoPartenza.trim()) e.aeroportoPartenza = "L'aeroporto di partenza e obbligatorio";
    if (!form.aeroportoArrivo.trim()) e.aeroportoArrivo = "L'aeroporto di arrivo e obbligatorio";
    if (!form.compagnia.trim()) e.compagnia = 'La compagnia aerea e obbligatoria';
    if (!form.email.trim()) e.email = "L'email e obbligatoria";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setEsito(null);
    try {
      const datiModulo = {
        clienteId: clienteTrovato.id, disservizio: { codice: form.disservizio },
        numeroVolo: form.numeroVolo.trim(), dataVolo: form.dataVolo,
        aeroportoPartenza: form.aeroportoPartenza.trim().toUpperCase(),
        aeroportoArrivo:   form.aeroportoArrivo.trim().toUpperCase(),
        compagnia: form.compagnia.trim(), email: form.email.trim(),
        telefono:    form.telefono.trim()    || null,
        indirizzo:   form.indirizzo.trim()   || null,
        descrizione: form.descrizione.trim() || null,
      };
      const risposta     = await moduliService.inserisciModulo(datiModulo);
      const esitoBackend = risposta?.listaEsiti?.[0];
      if (esitoBackend?.codice === 100) { setEsito('ok'); setForm(INITIAL_FORM); setClienteTrovato(null); }
      else { setEsito('errore'); }
      setMsgEsito(esitoBackend?.descrizione ?? 'Operazione completata.');
    } catch (error) {
      setEsito('errore');
      setMsgEsito(error.response?.data?.listaEsiti?.[0]?.descrizione || "Errore durante l'inserimento. Riprova.");
    } finally { setLoading(false); }
  };

  const handleAnnulla = () => navigate('/moduli');
  const handleLogout  = async () => { await authService.logout(); navigate('/login'); };

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
            <p className="g-topbar-sub">Inserimento nuovo modulo</p>
          </div>
          <div className="g-topbar-right">
            <button className="g-bell"><Bell size={20} /><span className="g-bell-badge">3</span></button>
            <div className="g-topbar-user">
              <div className="g-avatar"><User size={18} /></div>
              <span className="g-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="g-body im-body">
          <button className="g-back-btn" onClick={handleAnnulla}>
            <ArrowLeft size={16} /><span>Torna alla lista moduli</span>
          </button>

          <div className="g-card">
            <div className="im-card-header">
              <h2 className="im-card-title">Nuovo Modulo Rimborso</h2>
              <p className="im-card-sub">Compila i campi per registrare una nuova richiesta di rimborso</p>
            </div>

            {esito === 'ok'     && <div className="im-banner im-banner-ok"><CheckCircle2 size={18} /><span>{msgEsito}</span></div>}
            {esito === 'errore' && <div className="im-banner im-banner-err"><XCircle size={18} /><span>{msgEsito}</span></div>}

            <div className="g-form">
              <div className="g-section-title">Dati Cliente</div>

              <div className="g-field-form g-field-full">
                <label className="g-label">Cerca Cliente per Cognome <span className="g-required">*</span></label>
                {clienteTrovato ? (
                  <div className="im-cliente-selezionato">
                    <CheckCircle2 size={16} className="im-cliente-ok-ico" />
                    <div className="im-cliente-sel-info">
                      <span className="im-cliente-sel-nome">{clienteTrovato.cognome} {clienteTrovato.nome}</span>
                      <span className="im-cliente-sel-cf">{clienteTrovato.codiceFiscale}</span>
                    </div>
                    <span className="im-cliente-sel-tipo">
                      {clienteTrovato.tipoCliente?.codice === 'AGENZIA' ? clienteTrovato.nomeAgenzia : 'Privato'}
                    </span>
                    <button className="im-cliente-desel-btn" onClick={handleDeselezionaCliente}
                      title="Cambia cliente" disabled={isLoading}><XCircle size={16} /></button>
                  </div>
                ) : (
                  <div className="im-autocomplete-wrap" ref={searchWrapRef}>
                    <div className="im-search-input-wrap">
                      <Search size={15} className="im-search-ico" />
                      <input name="cognomeRicerca"
                        className={`g-input im-input-search ${errors.cognomeRicerca ? 'g-input-err' : ''}`}
                        placeholder="Es. Rossi" value={form.cognomeRicerca}
                        onChange={handleChange} disabled={isLoading} autoComplete="off" />
                      {cercandoCliente && <div className="im-search-spinner" />}
                    </div>
                    {dropdownAperto && risultatiRicerca.length > 0 && (
                      <div className="im-dropdown">
                        {risultatiRicerca.map(c => (
                          <button key={c.id} className="im-dropdown-item" onClick={() => handleSelezionaCliente(c)}>
                            <div className="im-dropdown-nome">{c.cognome} {c.nome}</div>
                            <div className="im-dropdown-cf">{c.codiceFiscale}</div>
                            <div className="im-dropdown-tipo">
                              {c.tipoCliente?.codice === 'AGENZIA' ? c.nomeAgenzia : 'Privato'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {erroreCliente && (
                      <div className="im-cliente-errore"><XCircle size={14} /><span>{erroreCliente}</span></div>
                    )}
                  </div>
                )}
                {errors.cognomeRicerca && <span className="g-err-msg">{errors.cognomeRicerca}</span>}
              </div>

              <div className="g-section-title">Dati Volo</div>

              <div className="g-field-form">
                <label className="g-label">Numero Volo <span className="g-required">*</span></label>
                <input name="numeroVolo" className={`g-input ${errors.numeroVolo ? 'g-input-err' : ''}`}
                  placeholder="Es. FR1234" value={form.numeroVolo} onChange={handleChange} disabled={isLoading} />
                {errors.numeroVolo && <span className="g-err-msg">{errors.numeroVolo}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Data Volo <span className="g-required">*</span></label>
                <input name="dataVolo" type="date" className={`g-input ${errors.dataVolo ? 'g-input-err' : ''}`}
                  value={form.dataVolo} onChange={handleChange} disabled={isLoading} />
                {errors.dataVolo && <span className="g-err-msg">{errors.dataVolo}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Aeroporto Partenza <span className="g-required">*</span></label>
                <input name="aeroportoPartenza"
                  className={`g-input ${errors.aeroportoPartenza ? 'g-input-err' : ''}`}
                  placeholder="Es. FCO" value={form.aeroportoPartenza}
                  onChange={handleChange} disabled={isLoading} maxLength={3} />
                {errors.aeroportoPartenza && <span className="g-err-msg">{errors.aeroportoPartenza}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Aeroporto Arrivo <span className="g-required">*</span></label>
                <input name="aeroportoArrivo"
                  className={`g-input ${errors.aeroportoArrivo ? 'g-input-err' : ''}`}
                  placeholder="Es. MXP" value={form.aeroportoArrivo}
                  onChange={handleChange} disabled={isLoading} maxLength={3} />
                {errors.aeroportoArrivo && <span className="g-err-msg">{errors.aeroportoArrivo}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Compagnia Aerea <span className="g-required">*</span></label>
                <input name="compagnia" className={`g-input ${errors.compagnia ? 'g-input-err' : ''}`}
                  placeholder="Es. Ryanair" value={form.compagnia} onChange={handleChange} disabled={isLoading} />
                {errors.compagnia && <span className="g-err-msg">{errors.compagnia}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Tipo Disservizio <span className="g-required">*</span></label>
                <select name="disservizio"
                  className={`g-input g-select ${errors.disservizio ? 'g-input-err' : ''}`}
                  value={form.disservizio} onChange={handleChange} disabled={isLoading}>
                  <option value="">Seleziona disservizio...</option>
                  <option value="RITARDO_AEREO">Ritardo Aereo</option>
                  <option value="VOLO_CANCELLATO">Volo Cancellato</option>
                  <option value="OVERBOOKING">Overbooking</option>
                  <option value="BAGAGLIO_SMARRITO">Bagaglio Smarrito</option>
                  <option value="PERDITA_COINCIDENZA">Perdita Coincidenza</option>
                  <option value="DECLASSAMENTO">Declassamento</option>
                </select>
                {errors.disservizio && <span className="g-err-msg">{errors.disservizio}</span>}
              </div>

              <div className="g-section-title">Dati di Contatto</div>

              <div className="g-field-form">
                <label className="g-label">Email <span className="g-required">*</span></label>
                <input name="email" type="email" className={`g-input ${errors.email ? 'g-input-err' : ''}`}
                  placeholder="Es. mario.rossi@email.com" value={form.email}
                  onChange={handleChange} disabled={isLoading} />
                {errors.email && <span className="g-err-msg">{errors.email}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Telefono</label>
                <input name="telefono" className="g-input" placeholder="Es. +39 333 1234567"
                  value={form.telefono} onChange={handleChange} disabled={isLoading} />
              </div>

              <div className="g-field-form g-field-full">
                <label className="g-label">Indirizzo</label>
                <input name="indirizzo" className="g-input" placeholder="Es. Via Roma 1, Milano"
                  value={form.indirizzo} onChange={handleChange} disabled={isLoading} />
              </div>

              <div className="g-section-title">Dettagli Disservizio</div>

              <div className="g-field-form g-field-full">
                <label className="g-label">Descrizione</label>
                <textarea name="descrizione" className="g-textarea"
                  placeholder="Descrivi il disservizio subito..."
                  value={form.descrizione} onChange={handleChange} disabled={isLoading} rows={4} />
              </div>
            </div>

            <div className="g-actions">
              <button className="g-btn-secondary" onClick={handleAnnulla} disabled={isLoading}>Annulla</button>
              <button className="g-btn-primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (<><div className="g-spinner" /><span>Salvataggio...</span></>) : (<><Save size={16} /><span>Salva Modulo</span></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InserisciModuloPage;
