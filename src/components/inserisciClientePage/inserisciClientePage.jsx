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

const INITIAL_FORM = { codiceFiscale: '', nome: '', cognome: '', tipoCliente: '', nomeAgenzia: '' };

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
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (esito) setEsito(null);
    if (name === 'tipoCliente' && value === 'PRIVATO') {
      setForm(prev => ({ ...prev, tipoCliente: value, nomeAgenzia: '' }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.codiceFiscale.trim()) e.codiceFiscale = 'Il codice fiscale e obbligatorio';
    if (!form.tipoCliente) e.tipoCliente = 'Il tipo cliente e obbligatorio';
    if (form.tipoCliente === 'AGENZIA' && !form.nomeAgenzia.trim())
      e.nomeAgenzia = 'Il nome agenzia e obbligatorio per il tipo AGENZIA';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setEsito(null);
    try {
      const datiCliente = {
        codiceFiscale: form.codiceFiscale.trim(),
        nome:          form.nome.trim()    || null,
        cognome:       form.cognome.trim() || null,
        tipoCliente:   { codice: form.tipoCliente },
        nomeAgenzia:   form.tipoCliente === 'AGENZIA' ? form.nomeAgenzia.trim() : null,
      };
      const risposta     = await clientiService.inserisciCliente(datiCliente);
      const esitoBackend = risposta?.listaEsiti?.[0];
      if (esitoBackend?.codice === 100) { setEsito('ok'); setForm(INITIAL_FORM); }
      else { setEsito('errore'); }
      setMsgEsito(esitoBackend?.descrizione ?? 'Operazione completata.');
    } catch (error) {
      setEsito('errore');
      setMsgEsito(error.response?.data?.listaEsiti?.[0]?.descrizione || "Errore durante l'inserimento. Riprova.");
    } finally { setLoading(false); }
  };

  const handleAnnulla = () => navigate('/clienti');
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
            <h1 className="g-topbar-title">Clienti</h1>
            <p className="g-topbar-sub">Inserimento nuovo cliente</p>
          </div>
          <div className="g-topbar-right">
            <button className="g-bell"><Bell size={20} /><span className="g-bell-badge">3</span></button>
            <div className="g-topbar-user">
              <div className="g-avatar"><User size={18} /></div>
              <span className="g-user-name">Admin</span>
            </div>
          </div>
        </header>

        <div className="g-body ic-body">
          <button className="g-back-btn" onClick={handleAnnulla}>
            <ArrowLeft size={16} /><span>Torna alla lista clienti</span>
          </button>

          <div className="g-card">
            <div className="ic-card-header">
              <h2 className="ic-card-title">Nuovo Cliente</h2>
              <p className="ic-card-sub">Compila i campi per registrare un nuovo cliente nel sistema</p>
            </div>

            {esito === 'ok'     && <div className="ic-banner ic-banner-ok"><CheckCircle2 size={18} /><span>{msgEsito}</span></div>}
            {esito === 'errore' && <div className="ic-banner ic-banner-err"><XCircle size={18} /><span>{msgEsito}</span></div>}

            <div className="g-form">
              <div className="g-field-form g-field-full">
                <label className="g-label">Codice Fiscale <span className="g-required">*</span></label>
                <input name="codiceFiscale"
                  className={`g-input ${errors.codiceFiscale ? 'g-input-err' : ''}`}
                  placeholder="Es. RSSMRA80A01H501K"
                  value={form.codiceFiscale} onChange={handleChange} disabled={isLoading} maxLength={16} />
                {errors.codiceFiscale && <span className="g-err-msg">{errors.codiceFiscale}</span>}
              </div>

              <div className="g-field-form">
                <label className="g-label">Nome</label>
                <input name="nome" className="g-input" placeholder="Es. Mario"
                  value={form.nome} onChange={handleChange} disabled={isLoading} />
              </div>

              <div className="g-field-form">
                <label className="g-label">Cognome</label>
                <input name="cognome" className="g-input" placeholder="Es. Rossi"
                  value={form.cognome} onChange={handleChange} disabled={isLoading} />
              </div>

              <div className="g-field-form">
                <label className="g-label">Tipo Cliente <span className="g-required">*</span></label>
                <select name="tipoCliente"
                  className={`g-input g-select ${errors.tipoCliente ? 'g-input-err' : ''}`}
                  value={form.tipoCliente} onChange={handleChange} disabled={isLoading}>
                  <option value="">Seleziona tipo...</option>
                  <option value="PRIVATO">Privato</option>
                  <option value="AGENZIA">Agenzia</option>
                </select>
                {errors.tipoCliente && <span className="g-err-msg">{errors.tipoCliente}</span>}
              </div>

              {form.tipoCliente === 'AGENZIA' && (
                <div className="g-field-form">
                  <label className="g-label">Nome Agenzia <span className="g-required">*</span></label>
                  <input name="nomeAgenzia"
                    className={`g-input ${errors.nomeAgenzia ? 'g-input-err' : ''}`}
                    placeholder="Es. Viaggio & Co"
                    value={form.nomeAgenzia} onChange={handleChange} disabled={isLoading} />
                  {errors.nomeAgenzia && <span className="g-err-msg">{errors.nomeAgenzia}</span>}
                </div>
              )}
            </div>

            <div className="g-actions">
              <button className="g-btn-secondary" onClick={handleAnnulla} disabled={isLoading}>Annulla</button>
              <button className="g-btn-primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (<><div className="g-spinner" /><span>Salvataggio...</span></>) : (<><Save size={16} /><span>Salva Cliente</span></>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InserisciClientePage;
