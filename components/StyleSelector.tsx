import React from 'react';
import { ChiikawaStyle } from '../types';

interface StyleSelectorProps {
  selectedStyle: ChiikawaStyle;
  onSelect: (style: ChiikawaStyle) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  const styles = [
    { type: ChiikawaStyle.STANDARD, emoji: '😊', label: 'Normal' },
    { type: ChiikawaStyle.EATING, emoji: '🍜', label: 'Yummy' },
    { type: ChiikawaStyle.CRYING, emoji: '😭', label: 'Scared' },
    { type: ChiikawaStyle.SLEEPY, emoji: '😴', label: 'Sleepy' },
    { type: ChiikawaStyle.CHAOTIC, emoji: '🌀', label: 'Chaos' },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6">
      {styles.map((style) => (
        <button
          key={style.type}
          onClick={() => onSelect(style.type)}
          className={`
            flex flex-col items-center p-3 rounded-2xl border-2 transition-all w-24 h-24 justify-center
            ${selectedStyle === style.type 
              ? 'bg-white border-chiikawa-pink shadow-lg scale-110' 
              : 'bg-white/50 border-transparent hover:bg-white hover:border-chiikawa-blue'}
          `}
        >
          <span className="text-3xl mb-1 filter drop-shadow-sm">{style.emoji}</span>
          <span className="text-xs font-bold text-chiikawa-text">{style.label}</span>
        </button>
      ))}
    </div>
  );
};