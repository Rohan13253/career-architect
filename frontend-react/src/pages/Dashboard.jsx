import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, History as HistoryIcon, User, LogOut, PlusCircle } from 'lucide-react';
import { auth, logout } from '../firebaseConfig';
import UploadView from '../components/UploadView';
import ResultsView from '../components/ResultsView';
import LinkedInResultsView from '../components/LinkedInResultsView';
import ProjectsView from '../components/ProjectsView';
import FloatingChat from '../components/FloatingChat';

export default function Dashboard({ user }) {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [linkedinData, setLinkedinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('upload'); // 'upload', 'resume', 'linkedin', 'projects'
  const [showUserMenu, setShowUserMenu] = useState(false);

/ 🔥 WAKE UP CALL: Fires whenever the user opens or navigates to the Dashboard
  useEffect(() => {
    fetch('https://career-architect-1.onrender.com')
      .then(res => console.log("Dashboard pinged the server: Awake!"))
      .catch(err => console.log("Dashboard waking up backend..."));
  }, []);

  // Restore analysis from session storage on load
  useEffect(() => {
    const savedResumeAnalysis = sessionStorage.getItem('currentResumeAnalysis');
    const savedLinkedInAnalysis = sessionStorage.getItem('currentLinkedInAnalysis');
    const savedView = sessionStorage.getItem('currentView');
    
    if (savedResumeAnalysis) {
      try {
        setResumeData(JSON.parse(savedResumeAnalysis));
        if (savedView === 'resume' || savedView === 'projects') {
          setCurrentView(savedView);
        }
      } catch (e) {
        console.error("Failed to restore resume analysis", e);
      }
    }
    
    if (savedLinkedInAnalysis) {
      try {
        setLinkedinData(JSON.parse(savedLinkedInAnalysis));
        if (savedView === 'linkedin') {
          setCurrentView('linkedin');
        }
      } catch (e) {
        console.error("Failed to restore LinkedIn analysis", e);
      }
    }
  }, []);

  const handleResumeAnalysisComplete = (result) => {
    setResumeData(result);
    setCurrentView('resume');
    sessionStorage.setItem('currentResumeAnalysis', JSON.stringify(result));
    sessionStorage.setItem('currentView', 'resume');
  };

  const handleLinkedInAnalysisComplete = (result) => {
    setLinkedinData(result);
    setCurrentView('linkedin');
    sessionStorage.setItem('currentLinkedInAnalysis', JSON.stringify(result));
    sessionStorage.setItem('currentView', 'linkedin');
  };

  const resetToUpload = () => {
    setResumeData(null);
    setLinkedinData(null);
    setError(null);
    setCurrentView('upload');
    sessionStorage.removeItem('currentResumeAnalysis');
    sessionStorage.removeItem('currentLinkedInAnalysis');
    sessionStorage.removeItem('currentView');
  };

  const handleLogout = async () => {
    sessionStorage.clear();
    await logout();
    navigate('/');
  };

  const handleViewProjects = () => {
    setCurrentView('projects');
    sessionStorage.setItem('currentView', 'projects');
  };

  const handleBackFromProjects = () => {
    setCurrentView('resume');
    sessionStorage.setItem('currentView', 'resume');
  };

  // Projects View (only available for resume analysis)
  if (resumeData && currentView === 'projects') {
    return (
      <>
        <ProjectsView 
          projects={resumeData.recommended_projects} 
          onBack={handleBackFromProjects} 
        />
        <FloatingChat analysisData={resumeData} />
      </>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      {/* Header Navigation */}
      <header className="dashboard-header-nav">
        <div className="header-nav-content">
          {/* Logo - Click to go to landing page */}
          <div className="header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-small"><Brain size={24} /></div>
            <span className="brand-text-small">Career<span className="logo-highlight">Architect</span></span>
            <span className="dashboard-badge">AI Career Analysis</span>
          </div>

          <div className="header-actions">
            {/* New Analysis Button - Show when we have any data */}
            {(resumeData || linkedinData) && (
              <button onClick={resetToUpload} className="btn-header-primary">
                <PlusCircle size={18} /> New Analysis
              </button>
            )}

            {/* History Button */}
            <button onClick={() => navigate('/history')} className="btn-header">
              <HistoryIcon size={18} /> History
            </button>
            
            {/* User Profile Menu */}
            <div className="user-menu-wrapper">
              <button className="user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
                {user?.photoURL ? <img src={user.photoURL} alt="Avatar" /> : <User size={20} />}
              </button>
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-info">
                    <p className="user-email">{user?.email}</p>
                  </div>
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

      {/* Main Content Area - Router */}
      {currentView === 'upload' && (
        <UploadView 
          onAnalysisComplete={handleResumeAnalysisComplete}
          onLinkedInAnalysisComplete={handleLinkedInAnalysisComplete}
          setLoading={setLoading} 
          loading={loading}
          setError={setError}
          error={error}
        />
      )}

      {currentView === 'resume' && resumeData && (
        <>
          <ResultsView 
            data={resumeData} 
            onViewProjects={handleViewProjects}
          />
          <FloatingChat analysisData={resumeData} />
        </>
      )}

      {currentView === 'linkedin' && linkedinData && (
        <LinkedInResultsView data={linkedinData} />
      )}
    </div>
  );
}