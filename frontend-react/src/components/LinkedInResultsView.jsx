import React from 'react';
import { Linkedin, CheckCircle2, XCircle, AlertTriangle, Award, Mail, Link2, FileText, GraduationCap, Shield, TrendingUp } from 'lucide-react';

export default function LinkedInResultsView({ data }) {

  const overallPercent = Math.round(data.overall_score * 10);

  const getScoreColor = (score) => {
    if (score >= 8) return '#10b981'; 
    if (score >= 6) return '#f59e0b'; 
    return '#ef4444';
  };

  return (
    <div className="linkedin-results-view">
      <main className="linkedin-main">

        {/* HEADER */}
        <div className="linkedin-header">
          <div className="linkedin-header-content">
            <Linkedin className="linkedin-header-icon" size={48} />
            <div>
              <h2 className="linkedin-title">LinkedIn Profile Analysis</h2>
              <p className="linkedin-subtitle">Professional brand optimization report</p>
            </div>
          </div>
        </div>

        {/* SCORE BANNER */}
        <div className="linkedin-score-banner">

          <div className="overall-score-row">

            {/* LEFT — CIRCLE */}
            <div className="circular-score-container">
              <svg className="circular-score-svg">
                <circle className="circle-bg" cx="75" cy="75" r="65"></circle>
                <circle 
                  className="circle-progress"
                  cx="75"
                  cy="75"
                  r="65"
                  style={{ strokeDashoffset: `calc(408 - (408 * ${overallPercent}) / 100)` }}
                ></circle>
              </svg>

              <div className="circle-score-text">
                <span className="circle-score-number">{overallPercent}</span>
                <span className="circle-score-outof">/100</span>
              </div>
            </div>

            {/* RIGHT — TITLE + ICON */}
            <div className="overall-score-title">
              <Award size={22} className="score-icon" />
              <span>Overall Profile Score</span>
            </div>

          </div>

          {/* RIGHT SIDE — SCORE CARDS */}
          <div className="score-breakdown-cards updated-gap">
            <ScoreCard 
              label="Professionalism" 
              score={data.professionalism_score}
              icon={<Shield size={18} />}
            />
            <ScoreCard 
              label="Completeness" 
              score={data.completeness_score}
              icon={<FileText size={18} />}
            />
            <ScoreCard 
              label="Optimization" 
              score={data.optimization_score}
              icon={<TrendingUp size={18} />}
            />
          </div>

        </div>

        {/* ANALYSIS GRID */}
        <div className="linkedin-analysis-grid">
          <AnalysisCard icon={<Link2 size={24} />} title="Custom LinkedIn URL"
            status={data.custom_url.status} score={data.custom_url.score}
            current={data.custom_url.current} recommendation={data.custom_url.recommendation}
            importance="High - Improves searchability and looks professional"
          />

          <AnalysisCard icon={<CheckCircle2 size={24} />} title="GitHub Profile Link"
            status={data.github_link.status} score={data.github_link.score}
            current={data.github_link.current} recommendation={data.github_link.recommendation}
            importance="Critical for technical roles"
          />

          <AnalysisCard icon={<Mail size={24} />} title="Contact Email"
            status={data.professional_email.status} score={data.professional_email.score}
            current={data.professional_email.current} recommendation={data.professional_email.recommendation}
            importance="First impression matters"
          />

          <AnalysisCard icon={<FileText size={24} />} title="Profile Header"
            status={data.profile_header.status} score={data.profile_header.score}
            current={data.profile_header.current} recommendation={data.profile_header.recommendation}
            importance="Shows up in search results"
          />

          <AnalysisCard icon={<FileText size={24} />} title="Summary/About Section"
            status={data.summary.status} score={data.summary.score}
            current={data.summary.current} recommendation={data.summary.recommendation}
            importance="Your professional story"
          />

          <AnalysisCard icon={<GraduationCap size={24} />} title="Education Details"
            status={data.education.status} score={data.education.score}
            current={data.education.current} recommendation={data.education.recommendation}
            importance="Academic credibility"
          />

          <AnalysisCard icon={<Award size={24} />} title="Certifications"
            status={data.certifications.status} score={data.certifications.score}
            current={data.certifications.current} recommendation={data.certifications.recommendation}
            importance="Validates your skills"
          />

          <AnalysisCard icon={<CheckCircle2 size={24} />} title="Skills & Endorsements"
            status={data.skills_section.status} score={data.skills_section.score}
            current={data.skills_section.current} recommendation={data.skills_section.recommendation}
            importance="LinkedIn's search algorithm boost"
          />
        </div>

        {/* ACTION ITEMS */}
        <div className="action-items-section">
          <h3 className="action-items-title">
            <TrendingUp size={24} />
            Priority Action Items
          </h3>

          <div className="action-items-list">
            {data.priority_actions.map((action, idx) => (
              <div key={idx} className="action-item">
                <div className="action-number">{idx + 1}</div>
                <div className="action-content">
                  <h4 className="action-title">{action.title}</h4>
                  <p className="action-description">{action.description}</p>
                  <span className={`action-impact ${action.impact.toLowerCase()}`}>Impact: {action.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}


/* SCORE CARD */
function ScoreCard({ label, score, icon }) {
  return (
    <div className="score-card-mini">
      <div className="score-card-icon">{icon}</div>
      <div className="score-card-content">
        <span className="score-card-label">{label}</span>
        <span className="score-card-value">{score}/10</span>
      </div>
    </div>
  );
}


/* ANALYSIS CARD */
function AnalysisCard({ icon, title, status, score, current, recommendation, importance }) {

  const getStatusClass = () => {
    if (status === 'excellent') return 'status-excellent';
    if (status === 'good') return 'status-good';
    if (status === 'needs_improvement') return 'status-warning';
    return 'status-poor';
  };

  const getStatusText = () => {
    if (status === 'excellent') return 'Excellent';
    if (status === 'good') return 'Good';
    if (status === 'needs_improvement') return 'Needs Work';
    return 'Missing/Poor';
  };

  return (
    <div className={`analysis-card ${getStatusClass()}`}>
      <div className="analysis-card-header">
        <div className="analysis-card-icon">{icon}</div>

        <div className="analysis-card-title-section">
          <h3 className="analysis-card-title">{title}</h3>
          <span className={`analysis-status-badge ${getStatusClass()}`}>{getStatusText()}</span>
        </div>

        <div className="analysis-score">
          <span className="score-value">{score}</span>
          <span className="score-max">/10</span>
        </div>
      </div>

      <div className="analysis-card-body">
        <div className="current-status">
          <span className="label">Current:</span>
          <p className="value">{current}</p>
        </div>

        <div className="recommendation-section">
          <span className="label">💡 Recommendation:</span>
          <p className="recommendation-text">{recommendation}</p>
        </div>

        <div className="importance-note">
          <span className="importance-label">Why it matters:</span>
          <span className="importance-text">{importance}</span>
        </div>
      </div>
    </div>
  );
}
