import React from 'react';
import { cn } from '@/lib/utils';

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
      onClick={handleFlip}
      className="cursor-pointer [perspective:1000px] w-[300px] h-[200px]"
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div
          className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center bg-white rounded-[10px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] p-5"
        >
          {front}
        </div>
        <div
          className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center bg-white rounded-[10px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] p-5 [transform:rotateY(180deg)]"
        >
          {back}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
