import React from 'react';
import { Rocket, Code2, Brain, Zap, CheckCircle2, Github, XCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import ScoreGauge from './ScoreGauge';

// ✅ Removed 'resetUpload' and 'navigate' props as they are handled in Dashboard header now
export default function ResultsView({ data, onViewProjects }) {
  return (
    <div className="dashboard-results-view">
      <main className="results-main">
        
        {/* ✅ CLEAN HEADER: No buttons, just the title */}
        <div className="results-header" style={{ marginBottom: '2rem' }}>
          <h2 className="results-title">Career Analysis Complete</h2>
          <p className="results-subtitle">Here's your personalized career roadmap</p>
        </div>

        {/* Score Banner */}
        <div className="score-banner-results">
          <div className="score-banner-content">
            <div className="score-gauge-wrapper">
              <ScoreGauge score={data.candidate_profile.total_score} />
            </div>

            <div className="info-cards-results">
              <InfoCard label="Candidate" value={data.candidate_profile.name} icon={<Brain size={16} />} />
              <InfoCard label="Level" value={data.candidate_profile.market_fit_level} icon={<Zap size={16} />} />
              <InfoCard label="Skills" value={`${data.candidate_profile.current_skills?.length || 0} Found`} icon={<CheckCircle2 size={16} />} />
              <InfoCard 
                label="GitHub" 
                value={data.candidate_profile.github_handle ? (data.candidate_profile.code_verified ? 'Verified' : 'Linked') : 'Not Linked'} 
                icon={<Github size={16} />} 
              />
            </div>
          </div>
        </div>

        {/* Charts & Skills Grid */}
        <div className="content-grid-results">
          <div className="radar-section-results">
            <h2 className="section-title-results">Skill Analysis</h2>
            <div className="radar-container-results">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.radar_chart_data}>
                  <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Your Score" dataKey="userScore" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} strokeWidth={2} />
                  <Radar name="Market Average" dataKey="marketScore" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="skills-section-results">
            {/* Skills You Have */}
            <div className="skill-card-results has-skills">
              <div className="skill-card-header">
                <CheckCircle2 className="skill-icon success" size={20} />
                <h3 className="skill-card-title">Skills You Have</h3>
                <span className="skill-badge success">{data.candidate_profile.current_skills?.length || 0}</span>
              </div>
              <div className="skill-chips-container">
                {data.candidate_profile.current_skills?.slice(0, 12).map((skill, idx) => (
                  <span key={idx} className="skill-chip success"><CheckCircle2 size={14} />{skill}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="skill-card-results missing-skills">
              <div className="skill-card-header">
                <XCircle className="skill-icon error" size={20} />
                <h3 className="skill-card-title">Skills to Acquire</h3>
                <span className="skill-badge error">{data.candidate_profile.missing_skills?.length || 0}</span>
              </div>
              <div className="skill-chips-container">
                {data.candidate_profile.missing_skills?.slice(0, 8).map((skill, idx) => (
                  <span key={idx} className="skill-chip error"><XCircle size={14} />{skill}</span>
                ))}
              </div>
            </div>

            <button onClick={onViewProjects} className="btn-view-projects">
              <Rocket size={20} /> View Recommended Projects <Code2 size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="info-card-results">
      <div className="info-card-label">{icon}<span>{label}</span></div>
      <p className="info-card-value">{value}</p>
    </div>
  );
}