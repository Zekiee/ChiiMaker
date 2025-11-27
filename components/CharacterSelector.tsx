import React from 'react';
import { ChiikawaCharacter } from '../types';
import { Check } from 'lucide-react';

interface CharacterSelectorProps {
  selectedCharacters: ChiikawaCharacter[];
  onToggle: (char: ChiikawaCharacter) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacters, onToggle }) => {
  const characters = [
    { type: ChiikawaCharacter.CHIIKAWA, label: 'Chiikawa', color: 'bg-white' },
    { type: ChiikawaCharacter.HACHIWARE, label: 'Hachiware', color: 'bg-blue-50' },
    { type: ChiikawaCharacter.USAGI, label: 'Usagi', color: 'bg-yellow-50' },
    { type: ChiikawaCharacter.MOMONGA, label: 'Momonga', color: 'bg-pink-50' },
    { type: ChiikawaCharacter.KURIMANJU, label: 'Kurimanju', color: 'bg-orange-50' },
    { type: ChiikawaCharacter.RAKKO, label: 'Rakko', color: 'bg-red-50' },
  ];

  return (
    <div className="mb-6">
      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
        Select Main Characters (Pick at least 1)
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {characters.map((char) => {
          const isSelected = selectedCharacters.includes(char.type);
          return (
            <button
              key={char.type}
              onClick={() => onToggle(char.type)}
              className={`
                relative p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center h-24
                ${isSelected 
                  ? 'border-chiikawa-pink bg-white shadow-md scale-105 z-10' 
                  : 'border-transparent bg-white/60 hover:bg-white hover:border-chiikawa-blue/30 opacity-80 hover:opacity-100'}
              `}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-chiikawa-pink text-white rounded-full p-0.5 shadow-sm z-20">
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
              
              <div className={`w-10 h-10 rounded-full mb-2 border shadow-sm ${char.color} flex items-center justify-center text-lg overflow-hidden`}>
                 {/* Fallback avatar */}
                 {char.type.substring(0, 1)}
              </div>
              <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-chiikawa-pink' : 'text-chiikawa-text'}`}>
                {char.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
