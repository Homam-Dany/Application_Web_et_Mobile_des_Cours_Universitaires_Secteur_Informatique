import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VirtualTutor = ({ currentCourseId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis ton Tuteur IA. Pose-moi n\'importe quelle question sur tes cours.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://localhost:8000/api/v1/chat/', {
        message: inputValue,
        course_id: currentCourseId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.answer }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: "Désolé, je rencontre un petit problème de connexion." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(59,130,246,0.5)',
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={28} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          height: '600px',
          maxHeight: '80vh',
          background: 'var(--bg-primary)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(59,130,246,0.2) 0%, rgba(147,51,234,0.2) 100%)',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '50%' }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Tuteur IA</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>● En ligne</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Container */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'var(--bg-secondary)'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                maxWidth: '85%'
              }}>
                <div style={{
                  background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                  padding: '8px',
                  borderRadius: '50%',
                  height: '36px',
                  width: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {msg.role === 'user' ? <UserIcon size={18} color="var(--text-secondary)" /> : <Bot size={18} color="var(--accent-primary)" />}
                </div>
                <div style={{
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.05)'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '8px', borderRadius: '50%', height: '36px', width: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={18} color="var(--accent-primary)" />
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span className="dot-typing"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '16px',
            background: 'var(--bg-primary)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '12px'
          }}>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question..."
              style={{
                flex: 1,
                background: 'var(--bg-tertiary)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 16px',
                borderRadius: '24px',
                color: 'white',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              style={{
                background: inputValue.trim() ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                border: 'none',
                width: '44px',
                height: '44px',
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                color: 'white',
                transition: 'background 0.2s'
              }}
            >
              <Send size={18} />
            </button>
          </form>

        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .dot-typing {
          width: 6px; height: 6px; border-radius: 50%;
          background-color: var(--accent-primary);
          animation: dotTyping 1.5s infinite linear;
        }
        @keyframes dotTyping {
          0% { box-shadow: 12px 0 0 0 var(--accent-primary), 24px 0 0 0 var(--text-muted); }
          50% { box-shadow: 12px 0 0 0 var(--text-muted), 24px 0 0 0 var(--accent-primary); }
          100% { box-shadow: 12px 0 0 0 var(--accent-primary), 24px 0 0 0 var(--text-muted); }
        }
      `}} />
    </>
  );
};

export default VirtualTutor;
