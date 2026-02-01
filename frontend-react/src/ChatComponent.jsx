import React, { useState, useRef } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';

const ChatComponent = ({ analysisData }) => {
  const firstSkill = analysisData.candidate_profile.missing_skills?.[0] || 'your tech stack';
  const candidateName = analysisData.candidate_profile.name?.split(' ')[0] || 'there';
  
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hi ${candidateName}! I've analyzed your resume. I see opportunities to grow in ${firstSkill}. Want to discuss your path forward?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5001/chat-with-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: input,
          chat_history: messages, 
          context: analysisData   
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.iconWrapper}>
          <Bot size={24} color="#8b5cf6" />
        </div>
        <div>
          <h3 style={styles.title}>AI Career Mentor</h3>
          <p style={styles.subtitle}>Ask about your analysis, skills, or projects</p>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              ...styles.messageWrapper,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div 
              style={{
                ...styles.messageBubble,
                ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble)
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div style={styles.loadingIndicator}>
            <Sparkles size={16} className="spin" style={{ marginRight: '8px' }} />
            <span>Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
          placeholder="Ask me anything about your career path..."
          style={styles.input}
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          style={{
            ...styles.sendButton,
            opacity: (loading || !input.trim()) ? 0.5 : 1
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

// Lovable Design Styles
const styles = {
  container: {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    borderRadius: '1.5rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
  },
  
  header: {
    padding: '1.5rem',
    background: 'rgba(11, 15, 25, 0.6)',
    borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  
  iconWrapper: {
    padding: '0.75rem',
    background: 'rgba(139, 92, 246, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  title: {
    margin: 0,
    color: '#f1f5f9',
    fontSize: '1.1rem',
    fontWeight: 700
  },
  
  subtitle: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  
  messages: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  
  messageWrapper: {
    display: 'flex',
    width: '100%'
  },
  
  messageBubble: {
    maxWidth: '75%',
    padding: '0.875rem 1.25rem',
    borderRadius: '1rem',
    lineHeight: 1.6,
    fontSize: '0.95rem'
  },
  
  userBubble: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    color: 'white',
    borderBottomRightRadius: '0.25rem',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
  },
  
  assistantBubble: {
    background: 'rgba(30, 41, 59, 0.6)',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    color: '#f1f5f9',
    borderBottomLeftRadius: '0.25rem'
  },
  
  loadingIndicator: {
    display: 'flex',
    alignItems: 'center',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontStyle: 'italic'
  },
  
  inputContainer: {
    padding: '1.5rem',
    background: 'rgba(11, 15, 25, 0.6)',
    borderTop: '1px solid rgba(139, 92, 246, 0.2)',
    display: 'flex',
    gap: '0.75rem'
  },
  
  input: {
    flex: 1,
    padding: '0.875rem 1.25rem',
    borderRadius: '0.75rem',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    background: 'rgba(30, 41, 59, 0.4)',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.3s ease'
  },
  
  sendButton: {
    padding: '0 1.25rem',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    border: 'none',
    borderRadius: '0.75rem',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
  }
};

export default ChatComponent;
