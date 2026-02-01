import React from 'react';

export default function ScoreGauge({ score }) {
  // Circle properties
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  // Color based on score
  const getColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#8b5cf6'; // Purple
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const color = getColor(score);
  const label = getLabel(score);

  return (
    <div className="score-gauge">
      <svg width={size} height={size} className="gauge-svg">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s ease',
          }}
        />
      </svg>

      {/* Score Content */}
      <div className="gauge-content">
        <div className="gauge-score" style={{ color }}>
          {score}
        </div>
        <div className="gauge-max">/100</div>
        <div className="gauge-label">{label}</div>
      </div>
    </div>
  );
}
