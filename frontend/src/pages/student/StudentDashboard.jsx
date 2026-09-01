import React, { useState, useEffect } from 'react';
import { Book, GraduationCap, Sparkles, Target, Clock, Trophy, AlertTriangle, TrendingUp, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStreamsAndStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const statsRes = await axios.get('http://localhost:8000/api/v1/student/stats/', { headers });
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchStreamsAndStats();
  }, []);

  return (
    <div className="app-container" style={{ paddingBottom: '60px' }}>
      <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GraduationCap size={32} color="var(--accent-primary)" />
            Espace Étudiant
          </h1>
          <p className="page-subtitle">Bienvenue {user?.first_name}, explorez vos cours et testez vos connaissances.</p>
        </div>
        
        {/* Gamification Badge */}
        {user && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(245,158,11,0.1)', 
            padding: '10px 16px', 
            borderRadius: '24px',
            border: '1px solid rgba(245,158,11,0.2)'
          }}>
            <Flame size={24} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--warning)', lineHeight: '1' }}>{user.current_streak} Jours</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Série actuelle</div>
            </div>
          </div>
        )}
      </div>

      {/* Code Challenge Banner */}
      <div 
        className="glass-panel" 
        onClick={() => navigate('/student/playground')}
        style={{ 
          marginBottom: '40px', 
          padding: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
          border: '1px solid var(--accent-primary)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--accent-primary)' }}>
            <Sparkles size={20} />
            Nouveau : Le Défi de Code IA !
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Entraîne-toi à coder directement sur la plateforme avec l'IA comme correcteur.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '24px' }}>
          Lancer l'éditeur
        </button>
      </div>

      {/* Chatbot Banner */}
      <div 
        className="glass-panel" 
        onClick={() => navigate('/student/chat')}
        style={{ 
          marginBottom: '40px', 
          padding: '24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(147,51,234,0.1) 0%, rgba(236,72,153,0.1) 100%)',
          border: '1px solid var(--accent-primary)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', marginBottom: '8px', color: 'var(--accent-primary)' }}>
            <Sparkles size={20} />
            Nouveau : Le Tuteur IA (Chat) !
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pose tes questions directement à notre assistant intelligent pour t'aider à réviser.</p>
        </div>
        <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '24px' }}>
          Ouvrir le Chat
        </button>
      </div>

      {/* --- STATISTICS DASHBOARD --- */}
      {stats && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: '600' }}>Mon Profil & Progression</h2>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Stats Cards */}
            <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', padding: '16px', borderRadius: '16px' }}>
                  <Target size={32} color="var(--accent-primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.average_score}/20</div>
                  <div style={{ color: 'var(--text-muted)' }}>Moyenne globale</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', padding: '16px', borderRadius: '16px' }}>
                  <Trophy size={32} color="var(--success)" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total_quizzes}</div>
                  <div style={{ color: 'var(--text-muted)' }}>QCMs complétés</div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(245,158,11,0.1)', padding: '16px', borderRadius: '16px' }}>
                  <Clock size={32} color="var(--warning)" />
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.estimated_hours}h</div>
                  <div style={{ color: 'var(--text-muted)' }}>Heures d'apprentissage</div>
                </div>
              </div>

            </div>

            {/* Radar Chart */}
            <div className="glass-panel" style={{ flex: '2', minWidth: '400px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Compétences par domaine</h3>
              <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radar_data}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="var(--accent-primary)"
                      fill="var(--accent-primary)"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {(stats.strengths?.length > 0 || stats.weaknesses?.length > 0) && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              
              {stats.strengths?.length > 0 && (
                <div className="glass-panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid var(--success)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', marginBottom: '16px' }}>
                    <TrendingUp size={20} />
                    Points Forts
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Vous maîtrisez très bien ces sujets :</p>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {stats.strengths.map((s, i) => (
                      <li key={i} style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {stats.weaknesses?.length > 0 && (
                <div className="glass-panel" style={{ flex: 1, padding: '24px', borderLeft: '4px solid var(--warning)' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', marginBottom: '16px' }}>
                    <AlertTriangle size={20} />
                    À Réviser
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>Nous vous conseillons de vous concentrer sur :</p>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {stats.weaknesses.map((s, i) => (
                      <li key={i} style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: rgba(59,130,246,0.5) !important;
        }
      `}} />
    </div>
  );
};

export default StudentDashboard;
