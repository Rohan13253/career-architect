// frontend-react/src/components/ScoreGauge.jsx
import React from 'react';

export default function ScoreGauge({ score }) {
  // Circle properties
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Clamp score between 0 and 100
  const safeScore = Math.min(Math.max(score, 0), 100);
  const progress = ((100 - safeScore) / 100) * circumference;
  const center = size / 2;

  // Color logic
  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // Green
    if (s >= 60) return '#8b5cf6'; // Purple
    if (s >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  const color = getColor(safeScore);
  const label = getLabel(safeScore);

  return (
    <div className="score-gauge-container">
      <svg width={size} height={size} className="gauge-svg">
        {/* Background Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />

        {/* Text INSIDE the SVG (Guarantees Centering) */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          style={{ fontSize: '3rem', fontWeight: '800' }}
        >
          {safeScore}
        </text>
        
        <text
          x="50%"
          y="65%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#94a3b8"
          style={{ fontSize: '0.9rem', fontWeight: '600' }}
        >
          / 100
        </text>
      </svg>
      
      {/* Label Text Below */}
      <div className="gauge-label-text" style={{ color: color }}>
        {label}
      </div>
    </div>
  );
}