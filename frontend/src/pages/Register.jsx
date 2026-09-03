import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Monitor, Code, Database, ChevronRight, Lock, Mail, User, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:8000/api/v1/users/register/', formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          background: '#ffffff', padding: '50px', borderRadius: '24px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          textAlign: 'center', maxWidth: '500px', width: '100%'
        }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>Inscription validée !</h2>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
            Félicitations, votre profil étudiant a été créé. Un email de confirmation a été envoyé à <strong style={{color: '#3b82f6'}}>{formData.email}</strong>.
          </p>
          <Link to="/login" style={{ 
            display: 'inline-flex', padding: '16px 32px', backgroundColor: '#3b82f6', color: '#ffffff', 
            borderRadius: '12px', fontWeight: '600', textDecoration: 'none', 
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            Retour à l'écran de connexion
          </Link>
        </div>
      </div>
    );
  }

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
            Commencez votre voyage <br/><strong style={{ fontWeight: '800' }}>vers la maîtrise du code.</strong>
          </h2>
          
          {/* Changed text color to be more readable and adapt to the #5e6ac0 background */}
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.6', marginBottom: '20px' }}>
            Rejoignez des centaines d'étudiants qui utilisent l'IA pour apprendre plus vite, pratiquer dans le cloud et valider leurs acquis.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <img 
              src="/register-avatar.png" 
              alt="Avatar Inscription" 
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

      {/* Right Panel - Register Form */}
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
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Créer un compte ✨</h2>
            <p style={{ color: '#64748b', fontSize: '16px' }}>Inscrivez-vous pour accéder à vos cours informatiques.</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '14px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fca5a5', fontSize: '14px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Prénom</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Jean"
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
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Nom</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Dupont"
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
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Email universitaire</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
              {loading ? 'Création...' : <>Valider l'inscription <ChevronRight size={18} /></>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
