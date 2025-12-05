import React from 'react';
import { Pencil, BookOpen, Edit3 } from 'lucide-react';

interface OptionItem {
  id: string;
  label: string;
  value: string; // The actual prompt text
  icon?: string;
}

interface OptionSelectorProps {
  title: string;
  icon: 'style' | 'story';
  options: OptionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  customValue: string;
  onCustomChange: (val: string) => void;
  placeholder?: string;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  title,
  icon,
  options,
  selectedId,
  onSelect,
  customValue,
  onCustomChange,
  placeholder
}) => {
  const isCustom = selectedId === 'custom';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {icon === 'style' ? <Pencil size={16} className="text-chiikawa-pink" /> : <BookOpen size={16} className="text-chiikawa-blue" />}
        <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">
          {title}
        </label>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2
              ${selectedId === opt.id 
                ? (icon === 'style' ? 'bg-chiikawa-pink text-white border-chiikawa-pink' : 'bg-chiikawa-blue text-white border-chiikawa-blue')
                : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
              }
            `}
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => onSelect('custom')}
          className={`
            px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2
            ${isCustom
              ? 'bg-gray-600 text-white border-gray-600'
              : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
            }
          `}
        >
          <Edit3 size={14} />
          自定义
        </button>
      </div>

      {isCustom && (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <textarea
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={placeholder || "请输入您的自定义描述..."}
            className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 transition-all text-gray-700 resize-none h-24"
          />
        </div>
      )}
    </div>
  );
};