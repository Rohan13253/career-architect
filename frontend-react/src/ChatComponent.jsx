// frontend-react/src/components/FloatingChat.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, MessageSquare, User, Sparkles, ChevronDown } from 'lucide-react';

export default function FloatingChat({ analysisData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize with a personalized welcome message
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (analysisData && messages.length === 0) {
      const name = analysisData.candidate_profile.name?.split(' ')[0] || "there";
      const skill = analysisData.candidate_profile.missing_skills?.[0] || "your tech stack";
      
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${name}! 👋 I've analyzed your profile. I see a great opportunity to improve your **${skill}** skills. \n\nAsk me about project ideas, interview prep, or how to learn specific technologies!`
        }
      ]);
    }
  }, [analysisData]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Use the Python backend endpoint
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
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "⚠️ I'm having trouble connecting to the mentor brain. Is the Python server running?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chat-widget-wrapper ${isOpen ? 'open' : ''}`}>
      {/* 1. The Toggle Button (Floating Action Button) */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="chat-btn-icon">
          <Bot size={28} className={isHovered ? 'animate-bounce' : ''} />
        </div>
        <span className="chat-btn-text">AI Mentor</span>
        {/* Notification Dot */}
        <span className="chat-notification-dot">1</span>
      </button>

      {/* 2. The Chat Window (Glass Card) */}
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
                <span className="status-dot pulse"></span>
                Online
              </div>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages Area */}
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

        {/* Input Area */}
        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask specific questions..."
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