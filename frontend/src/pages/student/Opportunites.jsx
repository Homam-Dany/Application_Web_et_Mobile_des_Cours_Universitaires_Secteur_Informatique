import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Building, ExternalLink, Calendar } from 'lucide-react';

const Opportunites = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://localhost:8000/api/v1/job-offers/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOffers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des opportunités...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
        Opportunités & Stages
      </h1>
      
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {offers.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Aucune offre disponible pour le moment.</p>
        ) : (
          offers.map(offer => (
            <div key={offer.id} style={{ 
              background: 'var(--bg-secondary)', 
              borderRadius: '12px', 
              padding: '1.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{offer.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Building size={16} style={{ marginRight: '0.5rem' }} />
                    {offer.company}
                  </div>
                  {offer.expires_at && (
                    <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <Calendar size={14} style={{ marginRight: '0.5rem' }} />
                      Expire le : {new Date(offer.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div style={{ background: 'var(--accent)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
                  <Briefcase size={20} />
                </div>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', flexGrow: 1, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {offer.description}
              </p>
              
              <a href={offer.link} target="_blank" rel="noopener noreferrer" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '0.75rem', 
                background: 'var(--accent)', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: '8px',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}>
                Postuler <ExternalLink size={16} style={{ marginLeft: '0.5rem' }} />
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Opportunites;
