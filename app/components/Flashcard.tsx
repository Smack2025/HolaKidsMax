'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';

interface FlashcardProps {
  front: string;
  back: string;
  onNext?: () => void;
}

export default function Flashcard({ front, back, onNext }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Card
      className="w-96 h-64 cursor-pointer perspective-1000 transition-transform duration-500"
      onClick={handleFlip}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-center">{front}</h2>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6">
          <h2 className="text-2xl font-bold text-center">{back}</h2>
        </div>
      </div>
    </Card>
  );
}
