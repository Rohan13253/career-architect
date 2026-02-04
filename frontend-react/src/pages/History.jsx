import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Brain, Zap, ChevronRight, ArrowLeft, 
  Loader2, BarChart3 
} from 'lucide-react';
import { auth } from '../firebaseConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function History({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth.currentUser) fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/history`, {
        headers: { 'X-Firebase-UID': auth.currentUser?.uid }
      });

      if (!response.ok) throw new Error('Failed to retrieve history');
      
      const data = await response.json();
      
      if (data.analyses && Array.isArray(data.analyses)) {
        setHistory(data.analyses);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: history.length,
    avg: history.length ? Math.round(history.reduce((a, b) => a + b.overallScore, 0) / history.length) : 0,
    best: history.length ? Math.max(...history.map(a => a.overallScore)) : 0
  };

  const handleViewAnalysis = (item) => {
    try {
      sessionStorage.setItem('currentAnalysis', item.fullAnalysisJson);
      navigate('/dashboard');
    } catch (e) {
      alert("Error loading this report.");
    }
  };

  if (loading) return (
    <div className="dashboard-wrapper flex-center-full">
       <Loader2 className="spin" size={40} />
       <p style={{marginTop: '1rem', color: '#94a3b8'}}>Loading your journey...</p>
    </div>
  );

  return (
    // ✅ FIX 1: Use dashboard-wrapper to match the main page layout
    <div className="dashboard-wrapper">
      
      {/* ✅ FIX 2: Add the Background Glow Effects */}
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      <div className="history-full-container">
        {/* ✅ FIX 3: Force justify-content to start so header isn't split */}
        <div className="results-header" style={{ marginBottom: '2rem', display:'flex', alignItems:'center', gap:'1rem', justifyContent: 'flex-start' }}>
          <button onClick={() => navigate('/dashboard')} className="btn-icon-only">
              <ArrowLeft size={20} />
          </button>
          <div>
              <h2 className="results-title">Career Journey</h2>
              <p className="results-subtitle">Track your progress over time</p>
          </div>
        </div>

        {/* STATS BANNER */}
        <div className="score-banner-results" style={{ marginBottom: '2rem' }}>
          <div className="info-cards-results" style={{ gridTemplateColumns: 'repeat(3, 1fr)', width: '100%', gap: '1rem' }}>
            <StatCard label="Total Reports" value={stats.total} icon={<BarChart3 size={16} />} />
            <StatCard label="Average Score" value={stats.avg} icon={<Zap size={16} />} />
            <StatCard label="Best Score" value={stats.best} icon={<Brain size={16} />} />
          </div>
        </div>

        {/* HISTORY LIST */}
        <div className="skill-card-results has-skills" style={{ padding: '0' }}>
          <div className="skill-card-header" style={{ padding: '1.25rem' }}>
            <Clock className="skill-icon success" size={20} />
            <h3 className="skill-card-title">Analysis Log</h3>
          </div>
          
          <div className="history-list-body">
            {history.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Clock size={48} style={{ opacity: 0.2 }} />
                <p>No history found yet.</p>
                <button onClick={() => navigate('/dashboard')} className="btn-view-projects">
                  Start New Analysis
                </button>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-row-item">
                  <div className="row-left">
                    <div className="score-circle-mini" style={{ 
                        borderColor: item.overallScore >= 70 ? '#10b981' : '#8b5cf6',
                        color: item.overallScore >= 70 ? '#10b981' : 'white'
                    }}>
                      {item.overallScore}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#f8fafc' }}>
                          {item.candidateName || 'Candidate Report'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                          {new Date(item.createdAt).toLocaleDateString()} • {item.resumeFilename}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleViewAnalysis(item)}
                    className="btn-view-projects"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ label, value, icon }) => (
  <div className="info-card-results">
    <div className="info-card-label">{icon}<span>{label}</span></div>
    <p className="info-card-value">{value}</p>
  </div>
);