import React, { useState } from 'react';
import { 
  Upload, Brain, CheckCircle2, XCircle, FileText, 
  Loader2, AlertCircle, Star, Code2, Layers, 
  MessageSquare, X, ChevronDown, ChevronUp 
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, Legend, ResponsiveContainer 
} from 'recharts';
import ChatComponent from './ChatComponent';
import './App.css';

const API_URL = 'http://localhost:8080/api/v1';

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]?.type === 'application/pdf') {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription.trim()) formData.append('jd', jobDescription.trim());

    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
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
    setSelectedProject(null);
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setExpandedQuestion(null);
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setExpandedQuestion(null);
  };

  return (
    <div className="app-container">
      {!data ? (
        /* ===== UPLOAD SCREEN ===== */
        <div className="upload-screen">
          <div className="upload-header">
            <div className="brand">
              <Brain className="brand-icon" size={40} />
              <h1 className="brand-title">CareerArchitect.ai</h1>
            </div>
            <p className="brand-subtitle">AI-Powered Career Engineering Platform</p>
          </div>

          <div className="upload-container">
            <div 
              className={`dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="dropzone-icon">
                {file ? <CheckCircle2 size={48} /> : <Upload size={48} />}
              </div>
              <h3 className="dropzone-title">
                {file ? file.name : 'Upload Your Resume'}
              </h3>
              <p className="dropzone-desc">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Drop PDF here or click to browse'}
              </p>
              
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="file-input"
                id="fileInput"
              />
              
              {!file && (
                <label htmlFor="fileInput" className="btn-upload">
                  Choose File
                </label>
              )}
            </div>

            <div className="jd-container">
              <div className="jd-header">
                <FileText size={20} />
                <span>Job Description (Optional)</span>
              </div>
              <textarea
                className="jd-textarea"
                placeholder="Paste job description for targeted gap analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>

            {file && (
              <button onClick={handleUpload} disabled={loading} className="btn-analyze">
                {loading ? (
                  <>
                    <Loader2 className="spin" size={20} />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Brain size={20} />
                    Analyze Resume
                  </>
                )}
              </button>
            )}

            {error && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ===== DASHBOARD SCREEN ===== */
        <div className="dashboard-screen">
          <div className="dashboard-header">
            <div className="brand-small">
              <Brain size={32} />
              <h2>CareerArchitect.ai</h2>
            </div>
            <button onClick={resetUpload} className="btn-reset">
              New Analysis
            </button>
          </div>

          {/* ===== SCORE BANNER ===== */}
          <div className="score-banner">
            <div className="score-main">
              <span className="score-label">Overall Score</span>
              <div className="score-value">{data.candidate_profile.total_score}</div>
              <span className="score-max">/100</span>
            </div>
            <div className="score-meta">
              <div className="meta-item">
                <span className="meta-label">Candidate</span>
                <span className="meta-value">{data.candidate_profile.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Level</span>
                <span className="meta-value">{data.candidate_profile.market_fit_level}</span>
              </div>
              {data.candidate_profile.github_handle && (
                <div className="meta-item">
                  <Code2 size={16} />
                  <span className="meta-value">
                    {data.candidate_profile.code_verified ? '✓ Code Verified' : 'GitHub Linked'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ===== SPLIT VIEW: RADAR + SKILLS ===== */}
          <div className="split-view">
            {/* LEFT: Radar Chart */}
            <div className="panel radar-panel">
              <h3 className="panel-title">Skill Analysis</h3>
              <div className="radar-container">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={data.radar_chart_data}>
                    <PolarGrid stroke="#1e3a5f" />
                    <PolarAngleAxis dataKey="skill" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                    <Radar 
                      name="Your Score" 
                      dataKey="userScore" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.6}
                    />
                    <Radar 
                      name="Market" 
                      dataKey="marketScore" 
                      stroke="#06b6d4" 
                      fill="#06b6d4" 
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT: Skills Breakdown */}
            <div className="panel skills-panel">
              <div className="skills-section">
                <h3 className="skills-title">
                  <CheckCircle2 size={20} className="icon-green" />
                  Skills You Have
                </h3>
                <div className="skills-grid">
                  {data.candidate_profile.current_skills?.map((skill, idx) => (
                    <div key={idx} className="skill-chip has-skill">
                      <CheckCircle2 size={16} />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div className="skills-divider"></div>

              <div className="skills-section">
                <h3 className="skills-title">
                  <XCircle size={20} className="icon-red" />
                  Skills to Acquire
                </h3>
                <div className="skills-grid">
                  {data.candidate_profile.missing_skills?.map((skill, idx) => (
                    <div key={idx} className="skill-chip missing-skill">
                      <XCircle size={16} />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===== PROJECT CARDS ===== */}
          <div className="projects-section">
            <h2 className="section-title">
              <Star size={24} />
              Recommended Projects
            </h2>
            <div className="project-cards">
              {data.recommended_projects?.map((project, idx) => (
                <div 
                  key={idx} 
                  className="project-card"
                  onClick={() => openProjectModal(project)}
                >
                  <div className="project-type">{project.type}</div>
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-tagline">{project.tagline}</p>
                  <div className="project-footer">
                    <span>{project.tech_stack?.length || 0} Technologies</span>
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CHAT COMPONENT ===== */}
          <div className="chat-section">
            <ChatComponent analysisData={data} />
          </div>
        </div>
      )}

      {/* ===== PROJECT MODAL OVERLAY ===== */}
      {selectedProject && (
        <div className="modal-overlay" onClick={closeProjectModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProjectModal}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="modal-type">{selectedProject.type}</div>
              <h2 className="modal-title">{selectedProject.title}</h2>
              <p className="modal-tagline">{selectedProject.tagline}</p>
            </div>

            <div className="modal-body">
              {/* Description */}
              <section className="modal-section">
                <h3 className="section-heading">Overview</h3>
                <p className="section-text">{selectedProject.description}</p>
              </section>

              {/* System Architecture */}
              <section className="modal-section">
                <h3 className="section-heading">
                  <Layers size={20} />
                  System Architecture
                </h3>
                <div className="architecture-box">
                  {selectedProject.system_architecture}
                </div>
              </section>

              {/* Tech Stack */}
              <section className="modal-section">
                <h3 className="section-heading">Tech Stack</h3>
                <div className="tech-grid">
                  {selectedProject.tech_stack?.map((tech, idx) => (
                    <div key={idx} className="tech-item">
                      <div className="tech-name">{tech.name}</div>
                      <div className="tech-usage">{tech.usage}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Learning Milestones */}
              <section className="modal-section">
                <h3 className="section-heading">Learning Roadmap</h3>
                <div className="milestones-list">
                  {selectedProject.learning_milestones?.map((milestone, idx) => (
                    <div key={idx} className="milestone-item">
                      <div className="milestone-week">Week {milestone.week}</div>
                      <div className="milestone-task">{milestone.task}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Mock Interview Questions */}
              <section className="modal-section">
                <h3 className="section-heading">
                  <MessageSquare size={20} />
                  Mock Interview Questions
                </h3>
                <div className="interview-questions">
                  {selectedProject.mock_interview_questions?.map((question, idx) => (
                    <div key={idx} className="question-item">
                      <button 
                        className="question-toggle"
                        onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                      >
                        <span className="question-number">Q{idx + 1}</span>
                        <span className="question-text">{question}</span>
                        {expandedQuestion === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      {expandedQuestion === idx && (
                        <div className="question-hint">
                          💡 Tip: Think about scalability, fault tolerance, and trade-offs in your answer.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Resume Bullets */}
              <section className="modal-section">
                <h3 className="section-heading">Ready-to-Use Resume Bullets</h3>
                <div className="resume-bullets">
                  {selectedProject.resume_bullets?.map((bullet, idx) => (
                    <div key={idx} className="bullet-item">
                      <span className="bullet-dot">•</span>
                      <span className="bullet-text">{bullet}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
