import React from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  onFlip?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({ front, back, onFlip }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) onFlip();
  };

  return (
    <div 
      className="flashcard" 
      onClick={handleFlip}
      style={{
        cursor: 'pointer',
        perspective: '1000px',
        width: '300px',
        height: '200px',
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transform: isFlipped ? 'rotateY(180deg)' : '',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.6s',
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          padding: '20px',
        }}>
          {front}
        </div>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          padding: '20px',
          transform: 'rotateY(180deg)',
        }}>
          {back}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
