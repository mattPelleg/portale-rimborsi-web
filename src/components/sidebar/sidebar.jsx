import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import {
  LayoutDashboard, Users, FileText, ClipboardList,
  Settings, LogOut, Plane
} from 'lucide-react';

const MENU = [
  { id: 'dashboard',    label: 'Dashboard',       Icon: LayoutDashboard, path: '/dashboard' },
  { id: 'clienti',      label: 'Clienti',         Icon: Users,           path: '/clienti' },
  { id: 'moduli',       label: 'Moduli Rimborso', Icon: FileText,        path: '/moduli' },
  { id: 'pratiche',     label: 'Pratiche',        Icon: ClipboardList,   path: '/pratiche' },
  { id: 'impostazioni', label: 'Impostazioni',    Icon: Settings,        path: '/impostazioni' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <aside className="g-sidebar">
      <div className="g-sidebar-head">
        <div className="g-logo">
          <div className="g-logo-icon"><Plane size={20} /></div>
          <span className="g-logo-txt">EasyFlyRefund</span>
        </div>
      </div>

      <nav className="g-sidebar-nav">
        {MENU.map(m => (
          <button
            key={m.id}
            className={`g-nav-item ${
              location.pathname.startsWith(m.path) && m.path !== '/'
                ? 'active' : ''
            }`}
            onClick={() => navigate(m.path)}
          >
            <m.Icon size={20} className="g-nav-ico" />
            <span className="g-nav-lbl">{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="g-sidebar-foot">
        <button className="g-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;