import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CodeChallenge = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Écris ton code Java ici\nclass Rectangle {\n\n}');
  const [language, setLanguage] = useState('java');
  const [status, setStatus] = useState('idle'); // idle, evaluating, success, error
  const [feedback, setFeedback] = useState(null);
  
  const promptText = "Mission : Créer une classe Java `Rectangle` avec deux attributs (longueur, largeur) et une méthode `calculerSurface()` qui retourne la surface du rectangle.";

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const submitCode = async () => {
    setStatus('evaluating');
    setFeedback(null);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://localhost:8000/api/v1/code/evaluate/', {
        code,
        language,
        prompt: promptText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data;
      setStatus(data.is_correct ? 'success' : 'error');
      setFeedback(data);
    } catch (e) {
      setStatus('error');
      setFeedback({
        is_correct: false,
        feedback: "Une erreur est survenue lors de l'évaluation.",
        hints: []
      });
    }
  };

  return (
    <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
      
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: 0, marginBottom: '12px' }}
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <h1 className="page-title">Défi de Code IA</h1>
          <p className="page-subtitle">Écris ton code et laisse l'IA l'évaluer en temps réel.</p>
        </div>
        <div>
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', outline: 'none' }}
          >
            <option value="java">Java</option>
            <option value="php">PHP</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      {/* Main Split View */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0, paddingBottom: '24px' }}>
        
        {/* Left Side: Prompt & Feedback */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          
          {/* Mission Card */}
          <div className="glass-panel" style={{ flex: '0 0 auto' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
              🎯 Ta Mission
            </h3>
            <p style={{ lineHeight: '1.6' }}>{promptText}</p>
          </div>

          {/* Feedback Card */}
          {status === 'evaluating' && (
            <div className="glass-panel" style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
              <p>L'IA analyse ton code...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {feedback && (
            <div className="glass-panel" style={{ 
              flex: '1', 
              borderLeft: `4px solid ${feedback.is_correct ? 'var(--success)' : 'var(--danger)'}`,
              overflowY: 'auto'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: feedback.is_correct ? 'var(--success)' : 'var(--danger)' }}>
                {feedback.is_correct ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                {feedback.is_correct ? 'Code Validé !' : 'Des erreurs détectées'}
              </h3>
              
              <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>{feedback.feedback}</p>

              {feedback.hints && feedback.hints.length > 0 && (
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <Lightbulb size={16} color="var(--warning)" /> Indices :
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feedback.hints.map((hint, i) => (
                      <li key={i} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Monaco Editor */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#1e1e1e' }}>
          
          <div style={{ flex: 1, padding: '16px 0' }}>
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false
              }}
            />
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              className="btn btn-primary" 
              onClick={submitCode}
              disabled={status === 'evaluating'}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <Play size={18} />
              {status === 'evaluating' ? 'Évaluation...' : 'Vérifier mon code'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CodeChallenge;
