// pages/History.jsx - COMPLETELY FIXED VERSION
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Trash2,
  Eye,
  Brain,
  User,
  LogOut,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { auth, logout } from '../firebaseConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function History({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      console.log('📊 Fetching history for UID:', currentUser.uid);

      const response = await fetch(`${API_URL}/history`, {
        method: 'GET',
        headers: {
          'X-Firebase-UID': currentUser.uid,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      console.log('✅ History loaded:', data);
      
      // ✅ FIX: Handle the response structure {total, analyses}
      if (data.analyses && Array.isArray(data.analyses)) {
        setHistory(data.analyses);
      } else if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
      
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = (analysis) => {
    try {
      const fullData = JSON.parse(analysis.fullAnalysisJson);
      sessionStorage.setItem('viewingAnalysis', JSON.stringify(fullData));
      navigate('/dashboard');
    } catch (err) {
      console.error('Error loading analysis:', err);
      alert('Failed to load analysis details');
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const currentUser = auth.currentUser;
      const response = await fetch(`${API_URL}/analysis/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'X-Firebase-UID': currentUser.uid,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== analysisId));
      } else {
        alert('Failed to delete analysis');
      }
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Calculate statistics
  const stats = {
    total: history.length,
    avgScore: history.length > 0 
      ? Math.round(history.reduce((sum, item) => sum + item.overallScore, 0) / history.length)
      : 0,
    bestScore: history.length > 0
      ? Math.max(...history.map(item => item.overallScore))
      : 0,
    recentTrend: history.length >= 2
      ? history[0].overallScore - history[1].overallScore
      : 0
  };

  return (
    <div className="history-page">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      {/* Header */}
      <header className="dashboard-header-nav">
        <div className="header-nav-content">
          <div className="header-brand">
            <button onClick={() => navigate('/dashboard')} className="btn-back-simple">
              <ArrowLeft size={20} />
            </button>
            <div className="brand-icon-small">
              <Brain size={24} />
            </div>
            <span className="brand-text-small">
              Career<span className="logo-highlight">Architect</span>
            </span>
            <h1 className="header-title" style={{ marginLeft: '1rem', fontSize: '1.25rem' }}>
              Analysis History
            </h1>
          </div>

          <div className="header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-header">
              New Analysis
            </button>

            <div className="user-menu-wrapper">
              <button 
                className="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" />
                ) : (
                  <User size={20} />
                )}
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-info">
                    <p className="user-email">{user?.email}</p>
                  </div>
                  <button className="menu-item" onClick={() => navigate('/dashboard')}>
                    <Brain size={16} />
                    Dashboard
                  </button>
                  <button className="menu-item menu-item-danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="history-main">
        {/* Stats Cards */}
        <div className="history-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Analyses</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.avgScore}</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{stats.bestScore}</div>
              <div className="stat-label">Best Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              {stats.recentTrend >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <div className="stat-value" style={{ color: stats.recentTrend >= 0 ? '#10b981' : '#ef4444' }}>
                {stats.recentTrend > 0 ? '+' : ''}{stats.recentTrend}
              </div>
              <div className="stat-label">Recent Trend</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loader2 className="spin" size={48} />
            <p>Loading your analysis history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <AlertTriangle size={48} />
            <h3>Failed to Load History</h3>
            <p>{error}</p>
            <button onClick={fetchHistory} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && history.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Analyses Yet</h3>
            <p>Upload your first resume to get started on your career journey!</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Start First Analysis
            </button>
          </div>
        )}

        {/* History List */}
        {!loading && !error && history.length > 0 && (
          <div className="history-list">
            <h2 className="history-list-title">
              Your Career Journey ({history.length} {history.length === 1 ? 'analysis' : 'analyses'})
            </h2>
            <div className="history-items">
              {history.map((item, index) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <div className="history-item-date">
                      <Calendar size={16} />
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="history-item-actions">
                      <button
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="btn-icon danger"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="history-item-content">
                    <div className="history-item-score">
                      <div
                        className="score-circle"
                        style={{
                          background: `conic-gradient(
                            ${item.overallScore >= 80 ? '#10b981' : item.overallScore >= 60 ? '#8b5cf6' : '#f59e0b'} ${item.overallScore}%,
                            rgba(139, 92, 246, 0.1) ${item.overallScore}%
                          )`
                        }}
                      >
                        <div className="score-inner">
                          <span className="score-value">{item.overallScore}</span>
                          <span className="score-max">/100</span>
                        </div>
                      </div>
                    </div>

                    <div className="history-item-details">
                      <h3 className="history-item-title">
                        {item.candidateName || `Career Analysis #${history.length - index}`}
                      </h3>
                      
                      {item.jobDescription && (
                        <p className="history-item-jd">
                          🎯 Job-targeted analysis
                        </p>
                      )}

                      <div className="history-item-metadata">
                        <span className="metadata-item">
                          ID: {item.id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="history-item-footer">
                    <button
                      onClick={() => handleViewAnalysis(item)}
                      className="btn btn-outline btn-view"
                    >
                      <Eye size={16} />
                      View Full Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
