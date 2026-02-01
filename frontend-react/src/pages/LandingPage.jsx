// pages/LandingPage.jsx
// Landing page with hero section and stats
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <div className="logo-icon">
              <Brain size={28} />
            </div>
            <span className="logo-text">
              Career<span className="logo-highlight">Architect</span>
            </span>
          </div>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>AI-Powered Career Development</span>
          </div>
          
          <h1 className="hero-title">
            Don't just apply for jobs.
            <br />
            <span className="hero-title-gradient">Architect your career.</span>
          </h1>
          
          <p className="hero-subtitle">
            Your personal CTO + Career Mentor. We analyze your skills, identify gaps,
            <br />
            and generate real engineering projects that prove you're ready for your
            <br />
            dream role.
          </p>

          <div className="hero-cta">
            <button onClick={() => navigate('/dashboard')} className="btn-primary-cta">
              Analyze My Career
              <ArrowRight size={20} />
            </button>
            <button className="btn-secondary-cta">
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Career Blueprints</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Skills Analyzed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section (Scrolled View) */}
      <section id="features" className="features-section">
        <div className="features-content">
          <h2 className="section-heading">
            Everything you need to <span className="text-gradient">level up</span>
          </h2>
          <p className="section-subheading">
            A complete toolkit for career transformation, powered by AI that understands the tech industry.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="feature-title">Skill Gap Analysis</h3>
              <p className="feature-desc">
                AI analyzes your current skills against market standards and identifies exactly what you need to learn.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <h3 className="feature-title">Smart Project Generator</h3>
              <p className="feature-desc">
                Get custom engineering project blueprints that fill your skill gaps and prove your expertise.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3 className="feature-title">Resume Parsing</h3>
              <p className="feature-desc">
                Upload your resume and let our AI extract your skills, experience, and potential in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-badge">
            <Sparkles size={14} />
            <span>Start your transformation today</span>
          </div>
          <h2 className="cta-title">
            Ready to <span className="text-gradient">architect</span> your future?
          </h2>
          <p className="cta-subtitle">
            Join thousands of developers who've used AI-powered career blueprints to land
            <br />
            their dream jobs at top tech companies.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary-cta">
            Analyze My Career Now
            <ArrowRight size={20} />
          </button>
          <p className="cta-disclaimer">No credit card required • Free skill analysis</p>
        </div>
      </section>
    </div>
  );
}
