import React, { useState } from 'react';
import { Upload, Brain, TrendingUp, Target, Clock, Loader2, AlertCircle, CheckCircle2, FileText, Star, Code, Calendar } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:5001/analyze'; // Ensure this matches your Python port

function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Track which project card is selected (0, 1, or 2)
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedProjectIndex(0); // Reset selection on new analysis

    const formData = new FormData();
    formData.append('file', file);
    
    if (jobDescription.trim()) {
      formData.append('jd', jobDescription.trim());
    }

    try {
      // NOTE: Calling Java Backend (8080) which forwards to Python (5001)
      // If running locally without Java, change URL to 'http://localhost:5001/analyze'
      const response = await fetch('http://localhost:8080/api/v1/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Analysis failed');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Failed to connect. Ensure Java Backend (8080) and Python (5001) are running.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setJobDescription('');
    setData(null);
    setError(null);
    setSelectedProjectIndex(0);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <Brain className="header-icon" size={48} />
            <h1 className="header-title">CareerArchitect.ai</h1>
          </div>
          <p className="header-subtitle">Intelligent Career Engineering Platform</p>
          {data && data.analysis_mode && (
            <div className="analysis-badge">
              {data.analysis_mode.includes("Gap") ? "🎯 Job-Specific Analysis" : "📊 Market Audit"}
            </div>
          )}
        </header>

        {!data ? (
          /* Upload Section */
          <div className="upload-section">
            <div 
              className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="upload-icon-wrapper">
                {file ? (
                  <CheckCircle2 className="upload-icon success" size={64} />
                ) : (
                  <Upload className="upload-icon" size={64} />
                )}
              </div>
              
              <h2 className="upload-title">
                {file ? file.name : 'Upload Your Resume'}
              </h2>
              
              <p className="upload-description">
                {file 
                  ? `Ready to analyze • ${(file.size / 1024).toFixed(1)} KB`
                  : 'Drag and drop your PDF resume or click to browse'
                }
              </p>
              
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="file-input"
                id="fileInput"
              />
              
              {!file && (
                <label htmlFor="fileInput" className="btn btn-secondary">
                  Choose File
                </label>
              )}
            </div>

            <div className="jd-section">
              <div className="jd-header">
                <FileText size={20} className="jd-icon" />
                <h3 className="jd-title">Paste Job Description (Optional)</h3>
              </div>
              <p className="jd-description">
                Add a job description to get targeted gap analysis, or leave blank for general market audit
              </p>
              <textarea
                className="jd-textarea"
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                disabled={loading}
              />
            </div>

            {/* BUTTONS SECTION - Only shows if file is selected */}
            {file && (
              <div className="upload-actions">
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <Loader2 className="btn-icon spin" size={20} />
                      Analyzing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Brain className="btn-icon" size={20} />
                      {jobDescription.trim() ? 'Analyze vs Job Description' : 'Analyze Resume'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetUpload}
                  className="btn btn-ghost"
                  disabled={loading}
                >
                  Clear All
                </button>
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          /* Dashboard Section */
          <div className="dashboard">
            
            {/* ================================================================== */}
            {/* 🌟 NEW PROFESSIONAL HEADER (Replaces all old separate boxes)       */}
            {/* ================================================================== */}
            <div className="candidate-header-card" style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '24px',
              padding: '40px',
              marginBottom: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              border: '1px solid #334155',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Decoration */}
              <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>

              {/* LEFT: Candidate Info */}
              <div style={{ display: 'flex', gap: '30px', zIndex: 2, flex: 1 }}>
                {/* Avatar */}
                <div style={{ 
                  width: '100px', height: '100px', 
                  borderRadius: '24px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                  color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '42px', fontWeight: '800',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)'
                }}>
                  {data.candidate_profile.name ? data.candidate_profile.name.charAt(0) : "C"}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <h2 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '2.4rem', letterSpacing: '-0.5px' }}>
                      {data.candidate_profile.name}
                    </h2>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
                      {data.analysis_mode?.includes("Gap") ? "Targeting Specific Role" : "General Market Audit"}
                    </p>
                  </div>

                  {/* Badges Row */}
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* 1. GitHub Badge (ALWAYS VISIBLE NOW) */}
                    <a 
                      href={data.candidate_profile.github_handle ? `https://github.com/${data.candidate_profile.github_handle}` : "#"}
                      target="_blank" 
                      rel="noreferrer"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '8px 16px',
                        background: data.candidate_profile.github_handle ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                        border: data.candidate_profile.github_handle ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(148, 163, 184, 0.3)',
                        borderRadius: '30px',
                        color: data.candidate_profile.github_handle ? '#4ade80' : '#94a3b8',
                        textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500',
                        cursor: data.candidate_profile.github_handle ? 'pointer' : 'default'
                      }}
                    >
                      <Code size={16} />
                      {data.candidate_profile.code_verified ? "Code Verified" : (data.candidate_profile.github_handle ? "GitHub Linked" : "No GitHub Found")}
                    </a>

                    {/* 2. Fit Badge */}
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '8px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '30px',
                        color: '#60a5fa',
                        fontSize: '0.9rem', fontWeight: '500'
                    }}>
                      <Target size={16} />
                      {data.candidate_profile.market_fit_level || "Analyzing Fit..."}
                    </div>
                  </div>

                  {/* Missing Skills (Moved Here) */}
                  <div style={{ marginTop: '10px' }}>
                     <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Recommended Focus Areas:</p>
                     <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {data.candidate_profile.missing_skills?.map((skill, idx) => (
                           <span key={idx} style={{ 
                              fontSize: '0.85rem', color: '#f8fafc', 
                              background: '#334155', padding: '4px 12px', borderRadius: '6px' 
                           }}>
                             {skill}
                           </span>
                        )) || <span style={{ color: '#94a3b8' }}>None detected</span>}
                     </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Score Gauge */}
              <div style={{ width: '220px', height: '180px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                 {/* Decorative Ring */}
                 <div style={{ 
                   position: 'absolute', width: '100%', height: '100%', 
                   borderRadius: '50%', border: '8px solid #1e293b',
                   borderTop: `8px solid ${data.candidate_profile.total_score > 75 ? '#4ade80' : '#fbbf24'}`,
                   transform: 'rotate(-45deg)'
                 }}></div>
                 
                 <div style={{ fontSize: '4.5rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                    {data.candidate_profile.total_score}
                 </div>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>CAREER SCORE</div>
              </div>
            </div>

            {/* Main Content Grid (Charts & Projects) */}
            <div className="content-grid">
              {/* Radar Chart */}
              <div className="card">
                <h3 className="card-title">
                  {data.analysis_mode && data.analysis_mode.includes("Gap") ? "Skills vs Job Requirements" : "Skill Analysis"}
                </h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radar_chart_data}>
                      <PolarGrid stroke="#334155" strokeWidth={1} />
                      <PolarAngleAxis 
                        dataKey="skill" 
                        stroke="#94a3b8"
                        tick={{ fill: '#cbd5e1', fontSize: 13, fontWeight: 600 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        stroke="#475569"
                        tick={false}
                        axisLine={false}
                      />
                      <Radar 
                        name="Your Score" 
                        dataKey="userScore" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="#3b82f6" 
                        fillOpacity={0.5}
                      />
                      <Radar 
                        name="Market Demand"
                        dataKey="marketScore" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fill="#8b5cf6" 
                        fillOpacity={0.2}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ================================================================== */}
              {/* 🚀 MULTI-PROJECT SELECTION SECTION                                 */}
              {/* ================================================================== */}

              <div className="project-section-wrapper" style={{ gridColumn: '1 / -1' }}>
                <h2 style={{color: 'white', marginBottom: '20px', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                   🚀 Choose Your Path
                </h2>
                
                {data.recommended_projects && data.recommended_projects.length > 0 ? (
                  <>
                    {/* 1. PROJECT CARDS ROW */}
                    <div className="project-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                      {data.recommended_projects.map((proj, index) => (
                        <div 
                          key={index}
                          onClick={() => setSelectedProjectIndex(index)}
                          style={{
                            backgroundColor: selectedProjectIndex === index ? '#f0f9ff' : '#1e293b',
                            border: selectedProjectIndex === index ? '2px solid #0ea5e9' : '1px solid #334155',
                            borderRadius: '16px',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: selectedProjectIndex === index ? 'translateY(-5px)' : 'none',
                            boxShadow: selectedProjectIndex === index ? '0 10px 25px rgba(14, 165, 233, 0.2)' : 'none',
                            position: 'relative'
                          }}
                        >
                          {/* Selection Indicator */}
                          {selectedProjectIndex === index && (
                            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                              <CheckCircle2 color="#0ea5e9" size={24} />
                            </div>
                          )}

                          <div style={{
                            display: 'inline-block',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            marginBottom: '16px',
                            backgroundColor: index === 0 ? 'rgba(239, 68, 68, 0.1)' : index === 1 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                            color: index === 0 ? '#ef4444' : index === 1 ? '#3b82f6' : '#a855f7'
                          }}>
                            {proj.type || (index === 0 ? "Gap Filler" : index === 1 ? "Strength Builder" : "Showstopper")}
                          </div>
                          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: selectedProjectIndex === index ? '#0f172a' : '#f1f5f9' }}>{proj.title}</h3>
                          <p style={{ fontSize: '0.95rem', color: selectedProjectIndex === index ? '#475569' : '#94a3b8', margin: 0, lineHeight: 1.5 }}>{proj.tagline}</p>
                        </div>
                      ))}
                    </div>

                    {/* 2. SELECTED PROJECT DETAILS */}
                    {data.recommended_projects[selectedProjectIndex] && (
                    <div className="card blueprint-card" style={{ animation: 'fadeIn 0.4s ease' }}>
                      <div className="blueprint-header" style={{ borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '25px' }}>
                        <h3 className="card-title" style={{ fontSize: '2rem', color: '#f8fafc', marginBottom: '10px' }}>
                          {data.recommended_projects[selectedProjectIndex].title}
                        </h3>
                        <p className="blueprint-tagline" style={{ fontSize: '1.2rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          {data.recommended_projects[selectedProjectIndex].tagline}
                        </p>
                      </div>
                      
                      <p className="blueprint-description" style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '30px' }}>
                        {data.recommended_projects[selectedProjectIndex].description}
                      </p>

                      <div style={{ margin: '30px 0', background: 'rgba(16, 185, 129, 0.08)', padding: '25px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          <Star size={20} color="#10b981" fill="#10b981" />
                          <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>Resume Power-Ups (Add these after completion)</strong>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '25px', color: '#e2e8f0' }}>
                          {data.recommended_projects[selectedProjectIndex].resume_bullets?.map((bullet, i) => (
                            <li key={i} style={{ marginBottom: '8px', fontSize: '1rem' }}>{bullet}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="blueprint-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '30px' }}>
                        <div className="blueprint-section">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Code size={22} className="text-blue-400" />
                            <h4 className="section-title" style={{ margin: 0 }}>Tech Stack</h4>
                          </div>
                          <div className="tech-stack">
                            {data.recommended_projects[selectedProjectIndex].tech_stack?.map((tech, idx) => (
                              <div key={idx} className="tech-item">
                                <span className="tech-name">{tech.name}</span>
                                <span className="tech-usage">{tech.usage}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="blueprint-section">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <Calendar size={22} className="text-purple-400" />
                            <h4 className="section-title" style={{ margin: 0 }}>Execution Roadmap</h4>
                          </div>
                          <div className="milestones">
                            {data.recommended_projects[selectedProjectIndex].learning_milestones?.map((milestone, idx) => (
                              <div key={idx} className="milestone">
                                <div className="milestone-badge">Week {milestone.week}</div>
                                <p className="milestone-task">{milestone.task}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    )}
                  </>
                ) : (
                  <div className="card">No Projects Found</div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <div className="actions-footer">
              <button onClick={resetUpload} className="btn btn-secondary">
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;