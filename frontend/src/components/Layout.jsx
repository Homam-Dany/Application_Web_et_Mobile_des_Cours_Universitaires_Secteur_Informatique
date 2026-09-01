import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, BarChart, Settings, LogOut, FileText, MessageCircle, Code, Briefcase, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BookOpen size={28} color="var(--accent-primary)" />
          Homam_Tech
        </div>
        
        <nav className="nav-links">
          {user?.role === 'admin' || user?.role === 'teacher' ? (
            <>
              <NavLink to="/admin" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <BarChart size={20} />
                Tableau de bord
              </NavLink>
              <NavLink to="/admin/validation" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <CheckSquare size={20} />
                Validation IA
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/student" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <BarChart size={20} />
                Tableau de Bord
              </NavLink>
              <NavLink to="/student/courses" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <FileText size={20} />
                Mes Cours
              </NavLink>
              <NavLink to="/student/chat" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <MessageCircle size={20} />
                Tuteur IA
              </NavLink>
              <NavLink to="/student/playground" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Code size={20} />
                Playground Code
              </NavLink>
              <NavLink to="/student/opportunites" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Briefcase size={20} />
                Opportunités
              </NavLink>
              <NavLink to="/student/flashcards" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Layers size={20} />
                Flashcards
              </NavLink>
            </>
          )}
        </nav>
        
        <div style={{ marginTop: 'auto' }}>
          <button className="nav-link" onClick={handleLogout} style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)' }}>
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
