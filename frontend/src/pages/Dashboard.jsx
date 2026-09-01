import React from 'react';
import { Book, CheckCircle, BrainCircuit } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bienvenue sur Homam_Tech</h1>
          <p className="page-subtitle">Aperçu de votre espace de révision et génération IA.</p>
        </div>
        <button className="btn btn-primary">
          <BrainCircuit size={18} />
          Générer de nouveaux QCM
        </button>
      </div>

      <div className="grid-cards">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '12px' }}>
              <Book size={24} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Modules Actifs</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>12</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fichiers importés cette semaine : +3</p>
        </div>
        
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(245,158,11,0.1)', padding: '12px', borderRadius: '12px' }}>
              <BrainCircuit size={24} color="var(--warning)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>QCM en Attente</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>48</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nécessitent une validation</p>
        </div>
        
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(16,185,129,0.1)', padding: '12px', borderRadius: '12px' }}>
              <CheckCircle size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Tests Passés</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>324</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Score moyen global : 76%</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
