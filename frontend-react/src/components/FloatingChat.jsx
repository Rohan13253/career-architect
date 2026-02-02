// frontend-react/src/components/FloatingChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageSquare, User, Sparkles, ChevronDown } from 'lucide-react';

export default function FloatingChat({ analysisData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize Chat with Context
  useEffect(() => {
    if (analysisData && messages.length === 0) {
      const name = analysisData.candidate_profile.name?.split(' ')[0] || "there";
      const skill = analysisData.candidate_profile.missing_skills?.[0] || "tech skills";
      
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${name}! 👋 I've analyzed your resume. I see a great opportunity to improve your **${skill}**. \n\nAsk me about project ideas, interview prep, or how to learn specific technologies!`
        }
      ]);
    }
  }, [analysisData]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. Get the URL from the environment (Best practice)
      // If VITE_PYTHON_API_URL is set in Vercel, it uses that.
      // Otherwise, it falls back to your hardcoded Render link or localhost.
      const PYTHON_API = import.meta.env.VITE_PYTHON_API_URL || 'https://career-architect-1.onrender.com';

      // 2. Make the request
      const res = await fetch(`${PYTHON_API}/chat-with-mentor`, {
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
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ I'm having trouble connecting to the mentor. Please try again in a moment!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget-wrapper">
      {/* 1. Floating Toggle Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <div className="chat-btn-icon">
          <Bot size={24} />
        </div>
        <span className="chat-btn-text">AI Mentor</span>
        <span className="chat-notification-dot">1</span>
      </button>

      {/* 2. Chat Window */}
      <div className={`chat-window ${isOpen ? 'active' : ''}`}>
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar-large">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="chat-title">Career Mentor</h3>
              <div className="chat-status">
                <span className="status-dot"></span>
                Online
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}
            >
              {msg.role === 'assistant' && (
                <div className="message-avatar bot">
                  <Bot size={16} />
                </div>
              )}
              
              <div className={`message-bubble ${msg.role}`}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              {msg.role === 'user' && (
                <div className="message-avatar user">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message-row bot-row">
              <div className="message-avatar bot">
                <Bot size={16} />
              </div>
              <div className="message-bubble assistant typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button 
            className="chat-send-btn" 
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}