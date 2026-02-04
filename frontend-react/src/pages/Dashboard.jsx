import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, History as HistoryIcon, User, LogOut, PlusCircle } from 'lucide-react';
import { auth, logout } from '../firebaseConfig';
import UploadView from '../components/UploadView';
import ResultsView from '../components/ResultsView';
import ProjectsView from '../components/ProjectsView';
import FloatingChat from '../components/FloatingChat';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAnalysisComplete = (result) => {
    setData(result);
    setCurrentView('dashboard');
  };

  const resetUpload = () => {
    setData(null);
    setError(null);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Projects View Drill-down
  if (data && currentView === 'projects') {
    return (
      <>
        <ProjectsView 
          projects={data.recommended_projects} 
          onBack={() => setCurrentView('dashboard')} 
        />
        <FloatingChat analysisData={data} />
      </>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      {/* ✅ HEADER UPDATES */}
      <header className="dashboard-header-nav">
        <div className="header-nav-content">
          {/* 1. Logo Click -> Redirect to Landing Page */}
          <div className="header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-small"><Brain size={24} /></div>
            <span className="brand-text-small">Career<span className="logo-highlight">Architect</span></span>
            <span className="dashboard-badge">AI Career Analysis</span>
          </div>

          <div className="header-actions">
            {/* 2. New Analysis Button (Moved Here) - Only visible if we have data */}
            {data && (
              <button onClick={resetUpload} className="btn-header-primary">
                <PlusCircle size={18} /> New Analysis
              </button>
            )}

            {/* 3. History Button */}
            <button onClick={() => navigate('/history')} className="btn-header">
              <HistoryIcon size={18} /> History
            </button>
            
            {/* 4. User Profile */}
            <div className="user-menu-wrapper">
              <button className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                {user?.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <User size={20} />}
              </button>
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-info"><p className="user-email">{user?.email}</p></div>
                  <button className="menu-item" onClick={() => navigate('/history')}>
                    <HistoryIcon size={16} /> Analysis History
                  </button>
                  <button className="menu-item menu-item-danger" onClick={handleLogout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!data ? (
        <UploadView 
          onAnalysisComplete={handleAnalysisComplete} 
          setLoading={setLoading} 
          loading={loading}
          setError={setError}
          error={error}
        />
      ) : (
        <ResultsView 
          data={data} 
          onViewProjects={() => setCurrentView('projects')}
        />
      )}

      {data && <FloatingChat analysisData={data} />}
    </div>
  );
}