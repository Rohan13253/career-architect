import React, { useState } from 'react';
import { Upload, Brain, CheckCircle2, FileText, Loader2, AlertCircle, Linkedin } from 'lucide-react';
import { auth } from '../firebaseConfig';

// ⭐ FIXED — Correct Backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function UploadView({ onAnalysisComplete, onLinkedInAnalysisComplete, setLoading, loading, setError, error }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState({ resume: false, linkedin: false });
  const [analysisType, setAnalysisType] = useState('resume'); // 'resume' or 'linkedin'

  const handleDrag = (e, type) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault(); 
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files?.[0]?.type === 'application/pdf') {
      if (type === 'resume') {
        setResumeFile(e.dataTransfer.files[0]);
      } else {
        setLinkedinFile(e.dataTransfer.files[0]);
      }
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  // ===============================
  // RESUME ANALYSIS
  // ===============================
  const handleResumeAnalysis = async () => {
    if (!resumeFile) return setError('Please select a resume file');
    setLoading(true); 
    setError(null);

    const formData = new FormData();
    formData.append('file', resumeFile);
    if (jobDescription.trim()) formData.append('jd', jobDescription.trim());

    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 
          'X-Firebase-UID': auth.currentUser.uid, 
          'X-User-Email': auth.currentUser.email || '' 
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Resume analysis failed');
      }

      const result = await response.json();
      onAnalysisComplete(result);

    } catch (err) {
      setError(err.message || 'Resume analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LINKEDIN ANALYSIS
  // ===============================
  const handleLinkedInAnalysis = async () => {
    if (!linkedinFile) return setError('Please select a LinkedIn PDF file');
    setLoading(true); 
    setError(null);

    const formData = new FormData();
    formData.append('file', linkedinFile);

    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      const response = await fetch(`${API_URL}/analyze-linkedin`, {
        method: 'POST',
        headers: { 
          'X-Firebase-UID': auth.currentUser.uid, 
          'X-User-Email': auth.currentUser.email || '' 
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'LinkedIn analysis failed');
      }

      const result = await response.json();
      onLinkedInAnalysisComplete(result);

    } catch (err) {
      setError(err.message || 'LinkedIn analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-upload-view">
      <div className="upload-content-wrapper">
        <div className="upload-hero">
          <Brain className="upload-hero-icon" size={48} />
          <h1 className="upload-title">Let's <span className="text-gradient">architect</span> your career</h1>
          <p className="upload-subtitle">Upload your resume or LinkedIn profile to get personalized insights</p>
        </div>

        {/* Analysis Type Selector */}
        <div className="analysis-type-selector">
          <button 
            className={`type-btn ${analysisType === 'resume' ? 'active' : ''}`}
            onClick={() => setAnalysisType('resume')}
          >
            <FileText size={20} />
            Resume Analysis
          </button>
          <button 
            className={`type-btn ${analysisType === 'linkedin' ? 'active' : ''}`}
            onClick={() => setAnalysisType('linkedin')}
          >
            <Linkedin size={20} />
            LinkedIn Profile
          </button>
        </div>

        <div className="upload-section">
          {/* RESUME UPLOAD */}
          {analysisType === 'resume' ? (
            <>
              <div className="upload-banner-wrapper">
                <div 
                  className={`upload-banner ${dragActive.resume ? 'drag-active' : ''} ${resumeFile ? 'has-file' : ''}`}
                  onDragEnter={(e) => handleDrag(e, 'resume')} 
                  onDragLeave={(e) => handleDrag(e, 'resume')} 
                  onDragOver={(e) => handleDrag(e, 'resume')} 
                  onDrop={(e) => handleDrop(e, 'resume')}
                >
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setResumeFile(e.target.files?.[0])} 
                    className="upload-input-hidden" 
                    id="resumeInput" 
                  />
                  
                  {resumeFile ? (
                    <div className="upload-file-info">
                      <CheckCircle2 size={32} className="file-success-icon" />
                      <div className="file-details">
                        <p className="file-name">{resumeFile.name}</p>
                        <p className="file-size">{(resumeFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <label htmlFor="resumeInput" className="btn-change-file">Change File</label>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <Upload size={40} className="upload-prompt-icon" />
                      <p className="upload-prompt-text">Drag and drop your resume (PDF)</p>
                      <label htmlFor="resumeInput" className="btn-browse">Browse Files</label>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Job Description */}
              <div className="jd-section-dashboard">
                <div className="jd-label-section">
                  <FileText size={24} className="jd-label-icon" />
                  <h3 className="jd-label-title">Job Description (Optional)</h3>
                </div>
                <textarea 
                  className="jd-textarea-dashboard" 
                  placeholder="Paste the job posting you're targeting..." 
                  value={jobDescription} 
                  onChange={(e) => setJobDescription(e.target.value)} 
                  rows={4} 
                />
              </div>

              {resumeFile && (
                <button 
                  onClick={handleResumeAnalysis} 
                  disabled={loading} 
                  className="btn-analyze-dashboard"
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={22} /> 
                      Analyzing Resume...
                    </>
                  ) : (
                    <>
                      <Brain size={22} /> 
                      Analyze My Resume
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {/* LINKEDIN UPLOAD */}
              <div className="upload-banner-wrapper">
                <div 
                  className={`upload-banner linkedin-banner ${dragActive.linkedin ? 'drag-active' : ''} ${linkedinFile ? 'has-file' : ''}`}
                  onDragEnter={(e) => handleDrag(e, 'linkedin')} 
                  onDragLeave={(e) => handleDrag(e, 'linkedin')} 
                  onDragOver={(e) => handleDrag(e, 'linkedin')} 
                  onDrop={(e) => handleDrop(e, 'linkedin')}
                >
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setLinkedinFile(e.target.files?.[0])} 
                    className="upload-input-hidden" 
                    id="linkedinInput" 
                  />
                  
                  {linkedinFile ? (
                    <div className="upload-file-info">
                      <CheckCircle2 size={32} className="file-success-icon linkedin-success" />
                      <div className="file-details">
                        <p className="file-name">{linkedinFile.name}</p>
                        <p className="file-size">{(linkedinFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <label htmlFor="linkedinInput" className="btn-change-file linkedin-btn">Change File</label>
                    </div>
                  ) : (
                    <div className="upload-prompt">
                      <Linkedin size={40} className="upload-prompt-icon linkedin-icon" />
                      <p className="upload-prompt-text">Drag and drop your LinkedIn PDF</p>
                      <p className="upload-prompt-subtitle">
                        Export from: Profile → More → Save to PDF
                      </p>
                      <label htmlFor="linkedinInput" className="btn-browse linkedin-browse">Browse Files</label>
                    </div>
                  )}
                </div>
              </div>

              {linkedinFile && (
                <button 
                  onClick={handleLinkedInAnalysis} 
                  disabled={loading} 
                  className="btn-analyze-dashboard linkedin-analyze"
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={22} /> 
                      Analyzing LinkedIn Profile...
                    </>
                  ) : (
                    <>
                      <Linkedin size={22} /> 
                      Analyze My LinkedIn
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {error && (
            <div className="error-alert-dashboard">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
