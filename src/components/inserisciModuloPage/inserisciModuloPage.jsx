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
import './inserisciModuloPage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const INITIAL_FORM = {
  cognomeRicerca:    '',
  numeroVolo:        '',
  dataVolo:          '',
  aeroportoPartenza: '',
  aeroportoArrivo:   '',
  compagnia:         '',
  disservizio:       '',
  email:             '',
  telefono:          '',
  indirizzo:         '',
  descrizione:       '',
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

  // chiude il dropdown cliccando fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setDropdownAperto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // debounce ricerca per cognome
  useEffect(() => {
    if (selezionandoRef.current) {
      selezionandoRef.current = false;
      return;
    }

    const cognome = form.cognomeRicerca.trim();

    setRisultatiRicerca([]);
    setDropdownAperto(false);
    setErroreCliente('');

    if (!cognome) return;

    setClienteTrovato(null);
    setCercandoCliente(true);

    const timer = setTimeout(async () => {
      try {
        const risposta = await clientiService.cercaCliente(cognome);
        const codice   = risposta?.listaEsiti?.[0]?.codice;

        if (codice === 100 && risposta.listaClienti?.length > 0) {
          setRisultatiRicerca(risposta.listaClienti);
          setDropdownAperto(true);
          setErroreCliente('');
        } else {
          setRisultatiRicerca([]);
          setErroreCliente('Nessun cliente attivo trovato con questo cognome.');
        }
      } catch {
        setRisultatiRicerca([]);
        setErroreCliente('Errore durante la ricerca del cliente.');
      } finally {
        setCercandoCliente(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      setCercandoCliente(false);
    };
  }, [form.cognomeRicerca]);

  const handleSelezionaCliente = (cliente) => {
    selezionandoRef.current = true;
    setClienteTrovato(cliente);
    setForm(prev => ({ ...prev, cognomeRicerca: `${cliente.cognome} ${cliente.nome}` }));
    setRisultatiRicerca([]);
    setDropdownAperto(false);
    setErroreCliente('');
    if (errors.cognomeRicerca) setErrors(prev => ({ ...prev, cognomeRicerca: '' }));
  };

  const handleDeselezionaCliente = () => {
    setClienteTrovato(null);
    setForm(prev => ({ ...prev, cognomeRicerca: '' }));
    setRisultatiRicerca([]);
    setErroreCliente('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (esito) setEsito(null);
  };

  const validate = () => {
    const e = {};
    if (!clienteTrovato)
      e.cognomeRicerca = 'Devi selezionare un cliente dalla lista';
    if (!form.disservizio)
      e.disservizio = 'Il tipo di disservizio e obbligatorio';
    if (!form.numeroVolo.trim())
      e.numeroVolo = 'Il numero volo e obbligatorio';
    if (!form.dataVolo)
      e.dataVolo = 'La data del volo e obbligatoria';
    if (!form.aeroportoPartenza.trim())
      e.aeroportoPartenza = 'L\'aeroporto di partenza e obbligatorio';
    if (!form.aeroportoArrivo.trim())
      e.aeroportoArrivo = 'L\'aeroporto di arrivo e obbligatorio';
    if (!form.compagnia.trim())
      e.compagnia = 'La compagnia aerea e obbligatoria';
    if (!form.email.trim())
      e.email = 'L\'email e obbligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
  if (!validate()) return;
  setLoading(true);
  setEsito(null);

  try {
    const datiModulo = {
      clienteId:         clienteTrovato.id,
      disservizio:       { codice: form.disservizio },
      numeroVolo:        form.numeroVolo.trim(),
      dataVolo:          form.dataVolo,
      aeroportoPartenza: form.aeroportoPartenza.trim().toUpperCase(),
      aeroportoArrivo:   form.aeroportoArrivo.trim().toUpperCase(),
      compagnia:         form.compagnia.trim(),
      email:             form.email.trim(),
      telefono:          form.telefono.trim() || null,
      indirizzo:         form.indirizzo.trim() || null,
      descrizione:       form.descrizione.trim() || null,
    };

    const risposta = await moduliService.inserisciModulo(datiModulo);

    const esitoBackend = risposta?.listaEsiti?.[0];
    const codice       = esitoBackend?.codice;
    const messaggio    = esitoBackend?.descrizione ?? 'Operazione completata.';

    if (codice === 100) {
      setEsito('ok');
      setForm(INITIAL_FORM);
      setClienteTrovato(null);
    } else {
      setEsito('errore');
    }
    setMsgEsito(messaggio);

  } catch (error) {
    const messaggioErrore =
      error.response?.data?.listaEsiti?.[0]?.descrizione ||
      'Errore durante l\'inserimento. Riprova.';
    setEsito('errore');
    setMsgEsito(messaggioErrore);
  } finally {
    setLoading(false);
  }
};

  const handleAnnulla = () => navigate('/moduli');

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="im-root">

      {/* SIDEBAR */}
      <aside className="im-sidebar">
        <div className="im-sidebar-head">
          <div className="im-logo">
            <div className="im-logo-icon"><Plane size={20} /></div>
            <span className="im-logo-txt">EasyFlyRefund</span>
          </div>
        </div>

        <nav className="im-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`im-nav-item ${location.pathname === m.path ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="im-nav-ico" />
              <span className="im-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="im-sidebar-foot">
          <button className="im-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="im-main">

        <header className="im-topbar">
          <div className="im-topbar-left">
            <h1 className="im-topbar-title">Moduli Rimborso</h1>
            <p className="im-topbar-sub">Inserimento nuovo modulo</p>
          </div>
          <div className="im-topbar-right">
            <button className="im-bell">
              <Bell size={20} />
              <span className="im-bell-badge">3</span>
            </button>
            <div className="im-topbar-user">
              <div className="im-avatar"><User size={18} /></div>
              <span className="im-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="im-body">

          <button className="im-back-btn" onClick={handleAnnulla}>
            <ArrowLeft size={16} />
            <span>Torna alla lista moduli</span>
          </button>

          <div className="im-card">

            <div className="im-card-header">
              <h2 className="im-card-title">Nuovo Modulo Rimborso</h2>
              <p className="im-card-sub">Compila i campi per registrare una nuova richiesta di rimborso</p>
            </div>

            {esito === 'ok' && (
              <div className="im-banner im-banner-ok">
                <CheckCircle2 size={18} />
                <span>{msgEsito}</span>
              </div>
            )}
            {esito === 'errore' && (
              <div className="im-banner im-banner-err">
                <XCircle size={18} />
                <span>{msgEsito}</span>
              </div>
            )}

            <div className="im-form">

              {/* SEZIONE CLIENTE */}
              <div className="im-section-title">Dati Cliente</div>

              <div className="im-field im-field-full">
                <label className="im-label">
                  Cerca Cliente per Cognome <span className="im-required">*</span>
                </label>

                {clienteTrovato ? (
                  <div className="im-cliente-selezionato">
                    <CheckCircle2 size={16} className="im-cliente-ok-ico" />
                    <div className="im-cliente-sel-info">
                      <span className="im-cliente-sel-nome">
                        {clienteTrovato.cognome} {clienteTrovato.nome}
                      </span>
                      <span className="im-cliente-sel-cf">
                        {clienteTrovato.codiceFiscale}
                      </span>
                    </div>
                    <span className="im-cliente-sel-tipo">
                      {clienteTrovato.tipoCliente?.codice === 'AGENZIA'
                        ? clienteTrovato.nomeAgenzia
                        : 'Privato'}
                    </span>
                    <button
                      className="im-cliente-desel-btn"
                      onClick={handleDeselezionaCliente}
                      title="Cambia cliente"
                      disabled={isLoading}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="im-autocomplete-wrap" ref={searchWrapRef}>
                    <div className="im-search-input-wrap">
                      <Search size={15} className="im-search-ico" />
                      <input
                        name="cognomeRicerca"
                        className={`im-input im-input-search ${errors.cognomeRicerca ? 'im-input-err' : ''}`}
                        placeholder="Es. Rossi"
                        value={form.cognomeRicerca}
                        onChange={handleChange}
                        disabled={isLoading}
                        autoComplete="off"
                      />
                      {cercandoCliente && <div className="im-search-spinner" />}
                    </div>

                    {dropdownAperto && risultatiRicerca.length > 0 && (
                      <div className="im-dropdown">
                        {risultatiRicerca.map(c => (
                          <button
                            key={c.id}
                            className="im-dropdown-item"
                            onClick={() => handleSelezionaCliente(c)}
                          >
                            <div className="im-dropdown-nome">
                              {c.cognome} {c.nome}
                            </div>
                            <div className="im-dropdown-cf">
                              {c.codiceFiscale}
                            </div>
                            <div className="im-dropdown-tipo">
                              {c.tipoCliente?.codice === 'AGENZIA'
                                ? c.nomeAgenzia
                                : 'Privato'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {erroreCliente && (
                      <div className="im-cliente-errore">
                        <XCircle size={14} />
                        <span>{erroreCliente}</span>
                      </div>
                    )}
                  </div>
                )}

                {errors.cognomeRicerca && (
                  <span className="im-err-msg">{errors.cognomeRicerca}</span>
                )}
              </div>

              {/* SEZIONE VOLO */}
              <div className="im-section-title">Dati Volo</div>

              <div className="im-field">
                <label className="im-label">
                  Numero Volo <span className="im-required">*</span>
                </label>
                <input
                  name="numeroVolo"
                  className={`im-input ${errors.numeroVolo ? 'im-input-err' : ''}`}
                  placeholder="Es. FR1234"
                  value={form.numeroVolo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.numeroVolo && <span className="im-err-msg">{errors.numeroVolo}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">
                  Data Volo <span className="im-required">*</span>
                </label>
                <input
                  name="dataVolo"
                  type="date"
                  className={`im-input ${errors.dataVolo ? 'im-input-err' : ''}`}
                  value={form.dataVolo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.dataVolo && <span className="im-err-msg">{errors.dataVolo}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">
                  Aeroporto Partenza <span className="im-required">*</span>
                </label>
                <input
                  name="aeroportoPartenza"
                  className={`im-input ${errors.aeroportoPartenza ? 'im-input-err' : ''}`}
                  placeholder="Es. FCO"
                  value={form.aeroportoPartenza}
                  onChange={handleChange}
                  disabled={isLoading}
                  maxLength={3}
                />
                {errors.aeroportoPartenza && <span className="im-err-msg">{errors.aeroportoPartenza}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">
                  Aeroporto Arrivo <span className="im-required">*</span>
                </label>
                <input
                  name="aeroportoArrivo"
                  className={`im-input ${errors.aeroportoArrivo ? 'im-input-err' : ''}`}
                  placeholder="Es. MXP"
                  value={form.aeroportoArrivo}
                  onChange={handleChange}
                  disabled={isLoading}
                  maxLength={3}
                />
                {errors.aeroportoArrivo && <span className="im-err-msg">{errors.aeroportoArrivo}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">
                  Compagnia Aerea <span className="im-required">*</span>
                </label>
                <input
                  name="compagnia"
                  className={`im-input ${errors.compagnia ? 'im-input-err' : ''}`}
                  placeholder="Es. Ryanair"
                  value={form.compagnia}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.compagnia && <span className="im-err-msg">{errors.compagnia}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">
                  Tipo Disservizio <span className="im-required">*</span>
                </label>
                <select
                  name="disservizio"
                  className={`im-input im-select ${errors.disservizio ? 'im-input-err' : ''}`}
                  value={form.disservizio}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Seleziona disservizio...</option>
                  <option value="RITARDO_AEREO">Ritardo Aereo</option>
                  <option value="VOLO_CANCELLATO">Volo Cancellato</option>
                  <option value="OVERBOOKING">Overbooking</option>
                  <option value="BAGAGLIO_SMARRITO">Bagaglio Smarrito</option>
                  <option value="PERDITA_COINCIDENZA">Perdita Coincidenza</option>
                  <option value="DECLASSAMENTO">Declassamento</option>
                </select>
                {errors.disservizio && <span className="im-err-msg">{errors.disservizio}</span>}
              </div>

              {/* SEZIONE CONTATTI */}
              <div className="im-section-title">Dati di Contatto</div>

              <div className="im-field">
                <label className="im-label">
                  Email <span className="im-required">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className={`im-input ${errors.email ? 'im-input-err' : ''}`}
                  placeholder="Es. mario.rossi@email.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && <span className="im-err-msg">{errors.email}</span>}
              </div>

              <div className="im-field">
                <label className="im-label">Telefono</label>
                <input
                  name="telefono"
                  className="im-input"
                  placeholder="Es. +39 333 1234567"
                  value={form.telefono}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="im-field im-field-full">
                <label className="im-label">Indirizzo</label>
                <input
                  name="indirizzo"
                  className="im-input"
                  placeholder="Es. Via Roma 1, Milano"
                  value={form.indirizzo}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* SEZIONE DESCRIZIONE */}
              <div className="im-section-title">Dettagli Disservizio</div>

              <div className="im-field im-field-full">
                <label className="im-label">Descrizione</label>
                <textarea
                  name="descrizione"
                  className="im-textarea"
                  placeholder="Descrivi il disservizio subito..."
                  value={form.descrizione}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

            </div>

            <div className="im-actions">
              <button className="im-btn-secondary" onClick={handleAnnulla} disabled={isLoading}>
                Annulla
              </button>
              <button className="im-btn-primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <><div className="im-spinner" /><span>Salvataggio...</span></>
                ) : (
                  <><Save size={16} /><span>Salva Modulo</span></>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InserisciModuloPage;