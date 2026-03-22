import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import clientiService from '../../services/clientiService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane, Bell, User,
  ArrowLeft, Save, CheckCircle2, XCircle
} from 'lucide-react';
import './InserisciClientePage.css';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const INITIAL_FORM = {
  codiceFiscale: '',
  nome:          '',
  cognome:       '',
  tipoCliente:   '',
  nomeAgenzia:   '',
};

const InserisciClientePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm]         = useState(INITIAL_FORM);
  const [errors, setErrors]     = useState({});
  const [isLoading, setLoading] = useState(false);
  const [esito, setEsito]       = useState(null);
  const [msgEsito, setMsgEsito] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (esito) setEsito(null);

    if (name === 'tipoCliente' && value === 'PRIVATO') {
      setForm(prev => ({ ...prev, tipoCliente: value, nomeAgenzia: '' }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.codiceFiscale.trim())
      e.codiceFiscale = 'Il codice fiscale e obbligatorio';
    if (!form.tipoCliente)
      e.tipoCliente = 'Il tipo cliente e obbligatorio';
    if (form.tipoCliente === 'AGENZIA' && !form.nomeAgenzia.trim())
      e.nomeAgenzia = 'Il nome agenzia e obbligatorio per il tipo AGENZIA';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setEsito(null);

    try {
      const datiCliente = {
        codiceFiscale: form.codiceFiscale.trim(),
        nome:          form.nome.trim()    || null,
        cognome:       form.cognome.trim() || null,
        tipoCliente:   { codice: form.tipoCliente },
        nomeAgenzia:   form.tipoCliente === 'AGENZIA'
                         ? form.nomeAgenzia.trim()
                         : null,
      };

      const risposta = await clientiService.inserisciCliente(datiCliente);

      const esitoBackend = risposta?.listaEsiti?.[0];
      const codice       = esitoBackend?.codice;
      const messaggio    = esitoBackend?.descrizione ?? 'Operazione completata.';

      if (codice === 100) {
        setEsito('ok');
        setForm(INITIAL_FORM);
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

  const handleAnnulla = () => navigate('/clienti');

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <div className="ic-root">

      {/* SIDEBAR */}
      <aside className="ic-sidebar">
        <div className="ic-sidebar-head">
          <div className="ic-logo">
            <div className="ic-logo-icon"><Plane size={20} /></div>
            <span className="ic-logo-txt">EasyFlyRefund</span>
          </div>
        </div>

        <nav className="ic-sidebar-nav">
          {MENU.map(m => (
            <button
              key={m.id}
              className={`ic-nav-item ${location.pathname === m.path ? 'active' : ''}`}
              onClick={() => navigate(m.path)}
            >
              <m.Icon size={20} className="ic-nav-ico" />
              <span className="ic-nav-lbl">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="ic-sidebar-foot">
          <button className="ic-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ic-main">

        {/* topbar */}
        <header className="ic-topbar">
          <div className="ic-topbar-left">
            <h1 className="ic-topbar-title">Clienti</h1>
            <p className="ic-topbar-sub">Inserimento nuovo cliente</p>
          </div>
          <div className="ic-topbar-right">
            <button className="ic-bell">
              <Bell size={20} />
              <span className="ic-bell-badge">3</span>
            </button>
            <div className="ic-topbar-user">
              <div className="ic-avatar"><User size={18} /></div>
              <span className="ic-user-name">Admin</span>
            </div>
          </div>
        </header>

        {/* body */}
        <div className="ic-body">

          <button className="ic-back-btn" onClick={handleAnnulla}>
            <ArrowLeft size={16} />
            <span>Torna alla lista clienti</span>
          </button>

          <div className="ic-card">

            <div className="ic-card-header">
              <h2 className="ic-card-title">Nuovo Cliente</h2>
              <p className="ic-card-sub">Compila i campi per registrare un nuovo cliente nel sistema</p>
            </div>

            {/* banner esito */}
            {esito === 'ok' && (
              <div className="ic-banner ic-banner-ok">
                <CheckCircle2 size={18} />
                <span>{msgEsito}</span>
              </div>
            )}
            {esito === 'errore' && (
              <div className="ic-banner ic-banner-err">
                <XCircle size={18} />
                <span>{msgEsito}</span>
              </div>
            )}

            {/* form */}
            <div className="ic-form">

              <div className="ic-field ic-field-full">
                <label className="ic-label">
                  Codice Fiscale <span className="ic-required">*</span>
                </label>
                <input
                  name="codiceFiscale"
                  className={`ic-input ${errors.codiceFiscale ? 'ic-input-err' : ''}`}
                  placeholder="Es. RSSMRA80A01H501K"
                  value={form.codiceFiscale}
                  onChange={handleChange}
                  disabled={isLoading}
                  maxLength={16}
                />
                {errors.codiceFiscale && (
                  <span className="ic-err-msg">{errors.codiceFiscale}</span>
                )}
              </div>

              <div className="ic-field">
                <label className="ic-label">Nome</label>
                <input
                  name="nome"
                  className="ic-input"
                  placeholder="Es. Mario"
                  value={form.nome}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="ic-field">
                <label className="ic-label">Cognome</label>
                <input
                  name="cognome"
                  className="ic-input"
                  placeholder="Es. Rossi"
                  value={form.cognome}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="ic-field">
                <label className="ic-label">
                  Tipo Cliente <span className="ic-required">*</span>
                </label>
                <select
                  name="tipoCliente"
                  className={`ic-input ic-select ${errors.tipoCliente ? 'ic-input-err' : ''}`}
                  value={form.tipoCliente}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Seleziona tipo...</option>
                  <option value="PRIVATO">Privato</option>
                  <option value="AGENZIA">Agenzia</option>
                </select>
                {errors.tipoCliente && (
                  <span className="ic-err-msg">{errors.tipoCliente}</span>
                )}
              </div>

              {form.tipoCliente === 'AGENZIA' && (
                <div className="ic-field">
                  <label className="ic-label">
                    Nome Agenzia <span className="ic-required">*</span>
                  </label>
                  <input
                    name="nomeAgenzia"
                    className={`ic-input ${errors.nomeAgenzia ? 'ic-input-err' : ''}`}
                    placeholder="Es. Viaggio & Co"
                    value={form.nomeAgenzia}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.nomeAgenzia && (
                    <span className="ic-err-msg">{errors.nomeAgenzia}</span>
                  )}
                </div>
              )}

            </div>

            {/* azioni */}
            <div className="ic-actions">
              <button
                className="ic-btn-secondary"
                onClick={handleAnnulla}
                disabled={isLoading}
              >
                Annulla
              </button>
              <button
                className="ic-btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="ic-spinner" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Salva Cliente</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InserisciClientePage;