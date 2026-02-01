// frontend-react/src/components/ProjectsView.jsx
import React, { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Code2,
  Calendar,
  Star,
  X,
} from 'lucide-react';

export default function ProjectsView({ projects, onBack }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  if (!projects || projects.length === 0) {
    return (
      <div className="projects-empty">
        <p>No projects recommended yet.</p>
        <button onClick={onBack} className="btn-back-projects">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="projects-view">
      {/* Background effects */}
      <div className="bg-effects">
        <div className="glow-orb glow-orb-purple" />
        <div className="glow-orb glow-orb-cyan" />
      </div>

      <div className="projects-container">
        {/* Header */}
        <div className="projects-header">
          {/* FIXED BUTTON HERE */}
          <button onClick={onBack} className="btn-back-projects">
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          
          <h1 className="projects-title">
            <Star size={28} className="text-yellow-400" />
            Recommended Projects
          </h1>
        </div>

        {/* Project Cards Grid */}
        <div className="projects-grid">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="project-card"
              onClick={() => setSelectedProject(project)}
            >
              <div className="project-badge">{project.type}</div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-tagline">{project.tagline}</p>
              <div className="project-meta">
                <span className="project-meta-item">
                  <Code2 size={16} />
                  {project.tech_stack?.length || 0} Technologies
                </span>
                <span className="project-meta-item">
                  <Calendar size={16} />
                  {project.learning_milestones?.length || 0} Weeks
                </span>
              </div>
              <div className="project-footer">
                <span className="project-link">View Full Blueprint →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Logic (Unchanged) */}
        {selectedProject && (
          <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedProject(null)}>
                <X size={24} />
              </button>

              <div className="modal-header">
                <div className="modal-badge">{selectedProject.type}</div>
                <h2 className="modal-title">{selectedProject.title}</h2>
                <p className="modal-tagline">{selectedProject.tagline}</p>
              </div>

              <div className="modal-body">
                {/* Overview */}
                <section className="modal-section">
                  <h3 className="modal-heading">Overview</h3>
                  <p className="modal-text">{selectedProject.description}</p>
                </section>

                {/* System Architecture */}
                {selectedProject.system_architecture && (
                  <section className="modal-section">
                    <h3 className="modal-heading">
                      <Layers size={20} />
                      System Architecture
                    </h3>
                    <div className="architecture-box">{selectedProject.system_architecture}</div>
                  </section>
                )}

                {/* Tech Stack */}
                {selectedProject.tech_stack && selectedProject.tech_stack.length > 0 && (
                  <section className="modal-section">
                    <h3 className="modal-heading">Tech Stack</h3>
                    <div className="tech-stack-grid">
                      {selectedProject.tech_stack.map((tech, idx) => (
                        <div key={idx} className="tech-stack-item">
                          <div className="tech-name">{tech.name}</div>
                          <div className="tech-usage">{tech.usage}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Learning Milestones */}
                {selectedProject.learning_milestones &&
                  selectedProject.learning_milestones.length > 0 && (
                    <section className="modal-section">
                      <h3 className="modal-heading">Learning Roadmap</h3>
                      <div className="milestones-list">
                        {selectedProject.learning_milestones.map((milestone, idx) => (
                          <div key={idx} className="milestone-item">
                            <div className="milestone-badge">Week {milestone.week}</div>
                            <div className="milestone-task">{milestone.task}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Mock Interview Questions */}
                {selectedProject.mock_interview_questions &&
                  selectedProject.mock_interview_questions.length > 0 && (
                    <section className="modal-section">
                      <h3 className="modal-heading">
                        <MessageSquare size={20} />
                        Mock Interview Questions
                      </h3>
                      <div className="interview-questions">
                        {selectedProject.mock_interview_questions.map((question, idx) => (
                          <div key={idx} className="question-item">
                            <button
                              className="question-button"
                              onClick={() =>
                                setExpandedQuestion(expandedQuestion === idx ? null : idx)
                              }
                            >
                              <span className="question-number">Q{idx + 1}</span>
                              <span className="question-text">{question}</span>
                              {expandedQuestion === idx ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </button>
                            {expandedQuestion === idx && (
                              <div className="question-hint">
                                💡 Tip: Think about scalability, fault tolerance, and trade-offs
                                in your answer.
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}