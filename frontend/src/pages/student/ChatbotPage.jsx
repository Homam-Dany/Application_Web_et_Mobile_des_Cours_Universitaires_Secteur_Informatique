import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User as UserIcon, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis ton Tuteur IA. Que souhaites-tu réviser aujourd\'hui ?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
        message: inputValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.answer }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: "Désolé, je rencontre un problème de connexion avec le serveur." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '24px',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Background Decorative Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }}></div>

      {/* Header */}
      <div className="glass-panel" style={{
        flexShrink: 0,
        padding: '20px 30px',
        margin: '20px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
      }}>
        <button 
          onClick={() => navigate('/student')}
          className="btn hover-lift"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '12px', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            background: 'var(--accent-gradient)', 
            padding: '12px', 
            borderRadius: '16px',
            boxShadow: '0 4px 15px var(--accent-glow)'
          }}>
            <Bot size={28} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>Tuteur Virtuel IA</h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ position: 'absolute', width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', opacity: 0.5, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                <span style={{ position: 'relative', width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></span>
              </span>
              En ligne et prêt à vous aider
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={chatAreaRef}
        style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '20px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        width: '100%',
        zIndex: 10,
        scrollBehavior: 'smooth'
      }}>
        {messages.map((msg, idx) => (
          <div key={idx} className="message-appear" style={{
            display: 'flex',
            gap: '16px',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            maxWidth: '85%'
          }}>
            <div style={{
              background: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--bg-secondary)',
              padding: '12px',
              borderRadius: '16px',
              height: '48px',
              width: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
            }}>
              {msg.role === 'user' ? <UserIcon size={22} color="var(--text-secondary)" /> : <Bot size={22} color="var(--accent-primary)" />}
            </div>
            <div style={{
              background: msg.role === 'user' ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '16px 24px',
              borderRadius: msg.role === 'user' ? '24px 8px 24px 24px' : '8px 24px 24px 24px',
              fontSize: '1.05rem',
              lineHeight: '1.6',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
              boxShadow: msg.role === 'user' ? '0 10px 25px -5px var(--accent-glow)' : '0 10px 25px -5px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message-appear" style={{ display: 'flex', gap: '16px', alignSelf: 'flex-start' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '16px', height: '48px', width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <Bot size={22} color="var(--accent-primary)" />
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px 24px', borderRadius: '8px 24px 24px 24px', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
              <span className="dot-typing-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="dot-typing-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="dot-typing-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{
        flexShrink: 0,
        padding: '24px 40px',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        background: 'linear-gradient(to top, var(--bg-primary) 80%, transparent)'
      }}>
        <form onSubmit={handleSend} style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          position: 'relative'
        }}>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Posez-moi une question sur vos cours..."
            style={{
              flex: 1,
              padding: '20px 28px',
              borderRadius: '24px',
              border: '1px solid var(--border-color)',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              fontSize: '1.1rem',
              outline: 'none',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)',
              transition: 'all 0.3s'
            }}
            onFocus={(e) => e.target.style.boxShadow = '0 10px 30px -10px var(--accent-glow)'}
            onBlur={(e) => e.target.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.05)'}
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="btn btn-primary"
            style={{ 
              borderRadius: '24px',
              padding: '0 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px var(--accent-glow)',
              opacity: (!inputValue.trim() || isTyping) ? 0.6 : 1,
              transform: (!inputValue.trim() || isTyping) ? 'none' : ''
            }}
          >
            <Send size={22} />
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.5); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-appear {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .dot-typing-bounce {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--accent-primary);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        input::placeholder {
          color: var(--text-muted);
        }
      `}} />
    </div>
  );
};

export default ChatbotPage;
