import React, { useState, useEffect } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const QuizValidation = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:8000/api/v1/questions/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const drafts = res.data.filter(q => q.status === 'draft_ai');
        setQuestions(drafts);
    } catch (e) {
        console.error("Failed to fetch drafts", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleValidate = async (id) => {
    try {
        const token = localStorage.getItem('access_token');
        await axios.post(`http://localhost:8000/api/v1/questions/${id}/validate/`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(questions.filter(q => q.id !== id));
    } catch (e) {
        alert("Erreur lors de la validation.");
        console.error(e);
    }
  };

  const handleReject = async (id) => {
    try {
        const token = localStorage.getItem('access_token');
        await axios.delete(`http://localhost:8000/api/v1/questions/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(questions.filter(q => q.id !== id));
    } catch (e) {
        alert("Erreur lors de la suppression.");
        console.error(e);
    }
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Validation des QCM (Enseignant)</h1>
          <p className="page-subtitle">Révisez et validez les questions générées par l'IA avant publication.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {questions.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Check size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
            <h2>Tout est validé !</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Il n'y a plus de brouillons IA en attente de validation.</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span className="badge badge-draft">
                  <AlertTriangle size={12} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                  Brouillon IA
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Difficulté: {q.difficulty}/5</span>
              </div>
              
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>{q.text}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {q.choices.map((choice, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '12px 16px', 
                      borderRadius: 'var(--radius-md)', 
                      background: choice.is_correct ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${choice.is_correct ? 'var(--success)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: choice.is_correct ? 'var(--success)' : 'transparent',
                      border: choice.is_correct ? 'none' : '1px solid var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                      {choice.is_correct && <Check size={14} />}
                    </div>
                    <span>{choice.text}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '8px' }}>Justification IA:</strong>
                <p style={{ fontSize: '0.95rem' }}>{q.justification}</p>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => handleReject(q.id)}>
                  <X size={18} />
                  Rejeter / Modifier
                </button>
                <button className="btn btn-success" onClick={() => handleValidate(q.id)}>
                  <Check size={18} />
                  Valider la question
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizValidation;
