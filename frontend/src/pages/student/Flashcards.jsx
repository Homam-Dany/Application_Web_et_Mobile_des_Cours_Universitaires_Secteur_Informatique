import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Check, X, RotateCw } from 'lucide-react';

const Flashcards = () => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Fetch all flashcards for demo purposes
      const res = await axios.get('http://localhost:8000/api/v1/flashcards/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Chargement des flashcards...</div>;

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <Layers size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Tout est à jour !</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Vous avez révisé toutes vos cartes pour aujourd'hui.</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Layers size={28} color="var(--accent-primary)" />
        Révision (Flashcards)
      </h1>

      <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Carte {currentIndex + 1} sur {cards.length}
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          width: '100%',
          minHeight: '300px',
          background: isFlipped ? 'var(--bg-secondary)' : 'var(--accent-primary)',
          color: isFlipped ? 'var(--text-primary)' : 'white',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
      >
        <div style={{ position: 'absolute', top: '15px', right: '15px', opacity: 0.5 }}>
          <RotateCw size={24} />
        </div>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {isFlipped ? currentCard.back : currentCard.front}
        </p>
      </div>

      {isFlipped && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', width: '100%' }}>
          <button 
            onClick={handleNext}
            style={{ flex: 1, padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Difficile (Revoir bientôt)
          </button>
          <button 
            onClick={handleNext}
            style={{ flex: 1, padding: '1rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Facile (J'ai compris)
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
