// frontend-react/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Brain,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  Code2,
  Rocket,
  Github,
  Zap,
  User,
  LogOut,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { auth, logout } from '../firebaseConfig';
import ScoreGauge from '../components/ScoreGauge';
import ProjectsView from '../components/ProjectsView';
import FloatingChat from '../components/FloatingChat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription.trim()) {
      formData.append('jd', jobDescription.trim());
    }

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setData(result);
    } catch {
      setError('Failed to connect. Ensure all services are running.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setJobDescription('');
    setData(null);
    setError(null);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Show projects view
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
      {/* Background effects */}
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      {/* Dashboard Header */}
      <header className="dashboard-header-nav">
        <div className="header-nav-content">
          {/* LOGO: Now Clickable to go Home */}
          <div 
            className="header-brand" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon-small">
              <Brain size={24} />
            </div>
            <span className="brand-text-small">
              Career<span className="logo-highlight">Architect</span>
            </span>
            <span className="dashboard-badge">Career Analysis Dashboard</span>
          </div>

          <div className="header-actions">
            <button className="btn-header">My Blueprints</button>
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
                  <button className="menu-item">
                    <User size={16} />
                    Profile Settings
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

      {!data ? (
        /* ===== UPLOAD VIEW ===== */
        <div className="dashboard-upload-view">
          <div className="upload-content-wrapper">
            <div className="upload-hero">
              <Brain className="upload-hero-icon" size={48} />
              <h1 className="upload-title">
                Let's <span className="text-gradient">architect</span> your career
              </h1>
              <p className="upload-subtitle">
                Upload your resume, describe your target role, and let our AI identify skill gaps
                <br />
                and generate a personalized project blueprint.
              </p>
            </div>

            {/* Refined Upload Banner */}
            <div className="upload-section">
              <div className="upload-banner-wrapper">
                <div className="upload-label-section">
                  <Upload className="upload-label-icon" size={24} />
                  <div>
                    <h3 className="upload-label-title">Upload Resume</h3>
                    <p className="upload-label-subtitle">PDF format recommended</p>
                  </div>
                </div>

                <div
                  className={`upload-banner ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        setFile(selectedFile);
                        setError(null);
                      }
                    }}
                    className="upload-input-hidden"
                    id="fileInput"
                  />

                  {file ? (
                    <div className="upload-file-info">
                      <CheckCircle2 size={32} className="file-success-icon" />
                      <div className="file-details">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <label htmlFor="fileInput" className="btn-change-file">
                        Change File
                      </label>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <Upload size={40} className="upload-prompt-icon" />
                      <p className="upload-prompt-text">
                        Drag and drop your resume here
                        <br />
                        <span className="upload-prompt-subtext">or click to browse</span>
                      </p>
                      <label htmlFor="fileInput" className="btn-browse">
                        Browse Files
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="jd-section-dashboard">
                <div className="jd-label-section">
                  <FileText size={24} className="jd-label-icon" />
                  <div>
                    <h3 className="jd-label-title">Job Description</h3>
                    <p className="jd-label-subtitle">Paste the job posting you're targeting</p>
                  </div>
                </div>
                <textarea
                  className="jd-textarea-dashboard"
                  placeholder="Paste the job description here... We'll analyze the requirements and compare them with your skills."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                />
              </div>

              {/* Analyze Button */}
              {file && (
                <button onClick={handleUpload} disabled={loading} className="btn-analyze-dashboard">
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={22} />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain size={22} />
                      Analyze My Career
                    </>
                  )}
                </button>
              )}

              {/* Error */}
              {error && (
                <div className="error-alert-dashboard">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ===== ANALYSIS RESULTS VIEW ===== */
        <div className="dashboard-results-view">
          <main className="results-main">
            {/* Results Header */}
            <div className="results-header">
              <div>
                <h2 className="results-title">Career Analysis Complete</h2>
                <p className="results-subtitle">Here's your personalized career roadmap</p>
              </div>
              <button onClick={resetUpload} className="btn-new-analysis">
                New Analysis
              </button>
            </div>

            {/* Score Banner */}
            <div className="score-banner-results">
              <div className="score-banner-content">
                <div className="score-gauge-wrapper">
                  <ScoreGauge score={data.candidate_profile.total_score} />
                </div>

                <div className="info-cards-results">
                  <InfoCard
                    label="Candidate"
                    value={data.candidate_profile.name}
                    icon={<Brain size={16} />}
                  />
                  <InfoCard
                    label="Level"
                    value={data.candidate_profile.market_fit_level}
                    icon={<Zap size={16} />}
                  />
                  <InfoCard
                    label="Skills"
                    value={`${data.candidate_profile.current_skills?.length || 0} Found`}
                    icon={<CheckCircle2 size={16} />}
                  />
                  <InfoCard
                    label="GitHub"
                    value={
                      data.candidate_profile.github_handle
                        ? data.candidate_profile.code_verified
                          ? 'Verified'
                          : 'Linked'
                        : 'Not Linked'
                    }
                    icon={<Github size={16} />}
                  />
                </div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="content-grid-results">
              <div className="radar-section-results">
                <h2 className="section-title-results">Skill Analysis</h2>
                <div className="radar-container-results">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data.radar_chart_data}>
                      <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                      <PolarAngleAxis
                        dataKey="skill"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Your Score"
                        dataKey="userScore"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Market Average"
                        dataKey="marketScore"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <Legend wrapperStyle={{ paddingTop: 20 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="skills-section-results">
                <div className="skill-card-results has-skills">
                  <div className="skill-card-header">
                    <CheckCircle2 className="skill-icon success" size={20} />
                    <h3 className="skill-card-title">Skills You Have</h3>
                    <span className="skill-badge success">
                      {data.candidate_profile.current_skills?.length || 0}
                    </span>
                  </div>
                  <div className="skill-chips-container">
                    {data.candidate_profile.current_skills?.slice(0, 12).map((skill, idx) => (
                      <span key={idx} className="skill-chip success">
                        <CheckCircle2 size={14} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="skill-card-results missing-skills">
                  <div className="skill-card-header">
                    <XCircle className="skill-icon error" size={20} />
                    <h3 className="skill-card-title">Skills to Acquire</h3>
                    <span className="skill-badge error">
                      {data.candidate_profile.missing_skills?.length || 0}
                    </span>
                  </div>
                  <div className="skill-chips-container">
                    {data.candidate_profile.missing_skills?.slice(0, 8).map((skill, idx) => (
                      <span key={idx} className="skill-chip error">
                        <XCircle size={14} />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Projects Button - Now Styled Correctly via CSS update */}
                <button
                  onClick={() => setCurrentView('projects')}
                  className="btn-view-projects"
                >
                  <Rocket size={20} />
                  View Recommended Projects
                  <Code2 size={16} />
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {data && <FloatingChat analysisData={data} />}
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="info-card-results">
      <div className="info-card-label">
        {icon}
        <span>{label}</span>
      </div>
      <p className="info-card-value">{value}</p>
    </div>
  );
}