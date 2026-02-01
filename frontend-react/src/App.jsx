import React, { useState } from 'react';
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
import ScoreGauge from './components/ScoreGauge';
import ProjectsView from './components/ProjectsView';
import FloatingChat from './components/FloatingChat';
import './App.css';

const API_URL = 'http://localhost:8080/api/v1';

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

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

  // Show projects view
  if (data && currentView === 'projects') {
    return (
      <>
        <ProjectsView
          projects={data.recommended_projects}
          onBack={() => setCurrentView('dashboard')}
        />
        {data && <FloatingChat analysisData={data} />}
      </>
    );
  }

  return (
    <div className="app-wrapper">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      {!data ? (
        /* ===== UPLOAD SCREEN ===== */
        <div className="upload-screen">
          <div className="upload-header">
            <div className="brand-logo">
              <div className="brand-icon-wrapper">
                <Brain className="brand-icon" size={40} />
              </div>
              <h1 className="brand-title">CareerArchitect.ai</h1>
            </div>
            <p className="brand-subtitle">AI-Powered Career Engineering Platform</p>
          </div>

          <div className="upload-content">
            {/* Dropzone */}
            <div
              className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="dropzone-inner">
                <div className={`dropzone-icon ${file ? 'success' : ''}`}>
                  {file ? <CheckCircle2 size={40} /> : <Upload size={40} />}
                </div>
                <div className="dropzone-text">
                  <h3 className="dropzone-title">
                    {file ? file.name : 'Upload Your Resume'}
                  </h3>
                  <p className="dropzone-desc">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drop PDF here or click to browse'}
                  </p>
                </div>

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
                  className="file-input-hidden"
                  id="fileInput"
                />

                {!file && (
                  <label htmlFor="fileInput" className="btn btn-outline">
                    Choose File
                  </label>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="jd-section">
              <div className="jd-label">
                <FileText size={18} />
                <span>Job Description (Optional)</span>
              </div>
              <textarea
                className="jd-input"
                placeholder="Paste job description for targeted gap analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            {/* Analyze Button */}
            {file && (
              <button onClick={handleUpload} disabled={loading} className="btn btn-primary btn-large">
                {loading ? (
                  <>
                    <Loader2 className="spin" size={22} />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain size={22} />
                    Analyze Resume
                  </>
                )}
              </button>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== DASHBOARD SCREEN ===== */
        <div className="dashboard-screen">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-brand">
                <div className="header-icon-wrapper">
                  <Brain className="header-icon" size={24} />
                </div>
                <h1 className="header-title">CareerArchitect.ai</h1>
              </div>
              <button onClick={resetUpload} className="btn btn-outline">
                New Analysis
              </button>
            </div>
          </header>

          <main className="dashboard-main">
            {/* Score Banner */}
            <div className="score-banner">
              <div className="score-banner-content">
                {/* Score Gauge */}
                <div className="score-gauge-wrapper">
                  <ScoreGauge score={data.candidate_profile.total_score} />
                </div>

                {/* Info Cards */}
                <div className="info-cards">
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

            {/* Skill Analysis + Skills Section */}
            <div className="content-grid">
              {/* Radar Chart */}
              <div className="radar-section">
                <h2 className="section-title">Skill Analysis</h2>
                <div className="radar-container">
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
                      <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skills Lists */}
              <div className="skills-section">
                {/* Skills You Have */}
                <div className="skill-card has-skills">
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
                    {(data.candidate_profile.current_skills?.length || 0) > 12 && (
                      <span className="skill-chip-more">
                        +{data.candidate_profile.current_skills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Skills to Acquire */}
                <div className="skill-card missing-skills">
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
                    {(data.candidate_profile.missing_skills?.length || 0) > 8 && (
                      <span className="skill-chip-more">
                        +{data.candidate_profile.missing_skills.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                {/* View Projects Button */}
                <button
                  onClick={() => setCurrentView('projects')}
                  className="btn btn-gradient btn-large"
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

      {/* Floating Chat Widget */}
      {data && <FloatingChat analysisData={data} />}
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="info-card">
      <div className="info-card-label">
        {icon}
        <span>{label}</span>
      </div>
      <p className="info-card-value">{value}</p>
    </div>
  );
}
