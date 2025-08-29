import React from 'react';

interface LessonCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  completed?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({ 
  title, 
  description, 
  onClick,
  completed = false
}) => {
  return (
    <div 
      onClick={onClick}
      className={`lesson-card ${completed ? 'completed' : ''}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: 'white',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        margin: '10px',
        maxWidth: '300px',
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>{title}</h3>
      <p style={{ color: '#666' }}>{description}</p>
      {completed && (
        <div style={{ 
          color: '#4CAF50',
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>✓</span>
          <span>Completed</span>
        </div>
      )}
    </div>
  );
};

export default LessonCard;
