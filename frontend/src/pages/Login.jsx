import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Monitor, Code, Database, ChevronRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Identifiants incorrects ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* Left Panel - Branding */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#5e6ac0', // Exact background color of the avatar
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '60px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Pattern */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px', opacity: 0.5 
        }} />
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
              <Monitor size={40} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '38px', fontWeight: '800', margin: 0, letterSpacing: '-1px', color: '#ffffff' }}>Homam_Tech</h1>
          </div>
          
          <h2 style={{ fontSize: '32px', fontWeight: '300', marginBottom: '20px', lineHeight: '1.4', color: '#ffffff' }}>
            L'excellence pédagogique <br/><strong style={{ fontWeight: '800' }}>au service de l'informatique.</strong>
          </h2>
          
          {/* Changed text color to be more readable and adapt to the #5e6ac0 background */}
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', marginBottom: '20px' }}>
            Accédez à vos cours, passez vos tests générés par IA et codez directement depuis votre navigateur avec notre plateforme d'apprentissage nouvelle génération.
          </p>

          {/* The image blends completely with the #5e6ac0 background */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src="/login-avatar.png" 
              alt="Avatar Étudiant" 
              style={{ width: '100%', maxWidth: '320px', height: 'auto', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '20px', opacity: 0.8, color: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={20} /> <span>Algorithmique</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} /> <span>Data Science</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: '40px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Bon retour ! 👋</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Veuillez entrer vos identifiants pour continuer.</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '14px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5', fontSize: '14px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Adresse Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="prenom.nom@etudiant.fr"
                  required
                  style={{ 
                    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', 
                    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                    color: '#0f172a', fontSize: '15px', outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                  style={{ 
                    width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', 
                    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc',
                    color: '#0f172a', fontSize: '15px', outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#ffffff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ 
              marginTop: '10px', background: '#3b82f6', color: '#ffffff', padding: '16px', 
              borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
              border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#2563eb'}
            onMouseOut={(e) => e.target.style.background = '#3b82f6'}
            >
              {loading ? 'Vérification...' : <>Se connecter <ChevronRight size={18} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                Créer un compte étudiant
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
