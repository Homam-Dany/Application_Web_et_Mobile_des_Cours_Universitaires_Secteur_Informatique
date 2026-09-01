import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const uidb64 = searchParams.get('uidb64');
      const token = searchParams.get('token');

      if (!uidb64 || !token) {
        setStatus('error');
        setMessage('Lien de vérification invalide.');
        return;
      }

      try {
        const res = await axios.post('http://localhost:8000/api/v1/users/verify-email/', {
          uidb64,
          token
        });
        setStatus('success');
        setMessage(res.data.message || 'Votre compte a été activé avec succès !');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Le lien de vérification est invalide ou a expiré.');
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-tertiary)', padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
        
        {status === 'loading' && (
          <div>
            <Loader className="spin" size={48} color="var(--accent-primary)" style={{ margin: '0 auto 24px auto', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Vérification en cours...</h2>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 24px auto' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Félicitations !</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              {message}
            </p>
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 32px' }}>
              Se connecter
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={64} color="var(--danger)" style={{ margin: '0 auto 24px auto' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>Erreur de vérification</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
              {message}
            </p>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 32px', background: 'var(--bg-tertiary)' }}>
              S'inscrire à nouveau
            </Link>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default VerifyEmail;
