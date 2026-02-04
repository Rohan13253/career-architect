import React, { useState } from 'react';
import { Upload, Brain, CheckCircle2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { auth } from '../firebaseConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function UploadView({ onAnalysisComplete, setLoading, loading, setError, error }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
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
    setLoading(true); setError(null);

    const formData = new FormData();
    formData.append('file', file);
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

      if (!response.ok) throw new Error('Analysis failed');
      const result = await response.json();
      onAnalysisComplete(result);
    } catch (err) {
      setError(err.message || 'Analysis failed');
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
          <p className="upload-subtitle">Upload your resume to identify skill gaps and generate a blueprint.</p>
        </div>

        <div className="upload-section">
          <div className="upload-banner-wrapper">
            {/* ... File Input ... */}
            <div className={`upload-banner ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                 onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0])} className="upload-input-hidden" id="fileInput" />
              
              {file ? (
                <div className="upload-file-info">
                  <CheckCircle2 size={32} className="file-success-icon" />
                  <div className="file-details"><p className="file-name">{file.name}</p></div>
                  <label htmlFor="fileInput" className="btn-change-file">Change File</label>
                </div>
              ) : (
                <div className="upload-prompt">
                  <Upload size={40} className="upload-prompt-icon" />
                  <p className="upload-prompt-text">Drag and drop resume</p>
                  <label htmlFor="fileInput" className="btn-browse">Browse Files</label>
                </div>
              )}
            </div>
          </div>

          <div className="jd-section-dashboard">
            <div className="jd-label-section">
               <FileText size={24} className="jd-label-icon" />
               <h3 className="jd-label-title">Job Description (Optional)</h3>
            </div>
            <textarea 
              className="jd-textarea-dashboard" 
              placeholder="Paste job posting..." 
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)} 
              rows={4} 
            />
          </div>

          {file && (
            <button onClick={handleUpload} disabled={loading} className="btn-analyze-dashboard">
              {loading ? <><Loader2 className="spin" size={22} /> Analyzing...</> : <><Brain size={22} /> Analyze My Career</>}
            </button>
          )}

          {error && <div className="error-alert-dashboard"><AlertCircle size={20} /><span>{error}</span></div>}
        </div>
      </div>
    </div>
  );
}