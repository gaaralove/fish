
import React from 'react';

interface VoiceIndicatorProps {
  isListening: boolean;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isListening }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-10 w-12 transition-opacity duration-300">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-blue-400 rounded-full transition-all duration-300 ${
            isListening ? 'animate-bounce' : 'h-1 opacity-20'
          }`}
          style={{ 
            animationDelay: `${i * 0.1}s`,
            height: isListening ? `${12 + Math.random() * 16}px` : '4px'
          }}
        />
      ))}
    </div>
  );
};
