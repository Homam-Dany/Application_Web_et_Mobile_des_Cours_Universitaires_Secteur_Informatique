import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';

const QuizTaker = () => {
  const { bankId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { question_id: choice_id }
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // 1. Fetch Quiz Data
        const quizRes = await axios.get(`http://localhost:8000/api/v1/question-banks/${bankId}/`, { headers });
        setQuiz(quizRes.data);
        
        // 2. Create Test Session
        const sessionRes = await axios.post(`http://localhost:8000/api/v1/test-sessions/`, {
          bank: bankId,
          student: user.id
        }, { headers });
        setSession(sessionRes.data);
        
      } catch (error) {
        console.error("Failed to load quiz", error);
        alert("Erreur lors du chargement du QCM.");
        navigate('/student/courses');
      }
    };
    if (user) {
      startQuiz();
    }
  }, [bankId, user, navigate]);

  // Timer effect
  useEffect(() => {
    if (isSubmitted || !quiz) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSubmitted, quiz]);

  const handleSelectChoice = (questionId, choiceId) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = async () => {
    if (!session) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`http://localhost:8000/api/v1/test-sessions/${session.id}/submit/`, {
        answers: answers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      setIsSubmitted(true);
    } catch (e) {
      console.error("Submit error", e);
      alert("Erreur lors de la soumission.");
    }
  };

  if (!quiz) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement du QCM...</div>;
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // RESULT VIEW
  if (isSubmitted && result) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '40px 20px' }}>
        <div className="glass-panel fade-in" style={{ padding: '40px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '24px' }} />
          <h1 style={{ marginBottom: '16px', fontSize: '2.5rem' }}>Terminé !</h1>
          
          <div style={{ margin: '32px 0', padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Votre Note</p>
            <p style={{ fontSize: '4rem', fontWeight: 'bold', color: result.score >= 10 ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
              {result.score.toFixed(1)} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ 20</span>
            </p>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Vous avez répondu correctement à {result.correct_answers} question(s) sur {result.total_questions}.
            </p>
          </div>
          
          <button className="btn btn-primary" onClick={() => navigate('/student/courses')} style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '12px' }}>
            Retour aux cours
          </button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="app-container fade-in" style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 8px 0' }}>{quiz.title}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Question {currentQuestionIndex + 1} sur {quiz.questions.length}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold', color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-primary)' }}>
          <Clock size={24} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '40px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: 'var(--accent-primary)', 
          width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%`,
          transition: 'width 0.3s ease'
        }}></div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', lineHeight: '1.5' }}>
            {currentQuestion.text}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentQuestion.choices.map(choice => (
              <div 
                key={choice.id}
                onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                style={{ 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: answers[currentQuestion.id] === choice.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: answers[currentQuestion.id] === choice.id ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  border: answers[currentQuestion.id] === choice.id ? '6px solid var(--accent-primary)' : '2px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }}></div>
                <span style={{ fontSize: '1.1rem' }}>{choice.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={20} /> Précédent
            </button>
            
            {isLastQuestion ? (
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--success)', borderColor: 'var(--success)' }}
              >
                Terminer et Noter <CheckCircle size={20} />
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Suivant <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;
