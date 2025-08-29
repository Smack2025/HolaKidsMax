'use client';

import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface LessonCardProps {
  title: string;
  description: string;
  progress?: number;
  onStart?: () => void;
}

export default function LessonCard({ title, description, progress = 0, onStart }: LessonCardProps) {
  return (
    <Card className="w-full max-w-sm p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
      
      {progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {onStart && (
        <Button
          onClick={onStart}
          className="w-full"
        >
          Start Les
        </Button>
      )}
    </Card>
  );
}
