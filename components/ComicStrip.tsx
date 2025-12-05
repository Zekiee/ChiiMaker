import React, { useRef, useState } from 'react';
import { ComicStory } from '../types';
import { Trash2, Copy, Check } from 'lucide-react';

interface ComicStripProps {
  story: ComicStory;
  onRemove: (id: string) => void;
}

export const ComicStrip: React.FC<ComicStripProps> = ({ story, onRemove }) => {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(story.prompt).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
      }).catch(err => {
        console.error('Failed to copy prompt: ', err);
        alert('复制失败！');
      });
    } else {
      alert("您的浏览器不支持自动复制功能。");
    }
  };

  const isStripLayout = story.layout === 'strip' || story.panels.length === 1;

  return (
    <div className="w-full max-w-lg mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Strip Header */}
      <div className="bg-white p-4 rounded-t-xl border-x-4 border-t-4 border-chiikawa-dark flex justify-between items-start">
        <div>
          <h3 className="font-serif text-xl font-bold text-chiikawa-dark line-clamp-1">
             {story.prompt}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
             {new Date(story.timestamp).toLocaleDateString()} • {story.characters.join(', ')}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 ml-2">
          <button onClick={handleCopyPrompt} className="text-gray-300 hover:text-chiikawa-blue transition-colors" title="复制提示词">
            {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
          <button onClick={() => onRemove(story.id)} className="text-gray-300 hover:text-red-400 transition-colors" title="删除漫画">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Comic Content */}
      <div ref={stripRef} className="border-x-4 border-b-4 border-chiikawa-dark bg-white shadow-2xl overflow-hidden">
        {isStripLayout ? (
           /* SINGLE IMAGE STRIP MODE */
           <div className="w-full relative group">
             {story.panels[0]?.imageUrl ? (
                <img 
                  src={story.panels[0].imageUrl} 
                  alt="Generated Chiikawa Comic Strip"
                  className="w-full h-auto block"
                />
             ) : (
                <div className="w-full aspect-[9/16] bg-chiikawa-bg border-2 border-dashed border-chiikawa-blue/20 rounded-lg flex flex-col items-center justify-center text-center p-4">
                  <div className="text-4xl mb-2 opacity-50">🖼️</div>
                  <p className="font-serif text-chiikawa-text/60">
                    图片未保存以节省空间
                  </p>
                  <p className="text-xs text-chiikawa-text/40 mt-1">
                    （仅保存最新一张漫画图）
                  </p>
                </div>
             )}
           </div>
        ) : (
           /* LEGACY GRID MODE (4 separate images) */
           <div className="flex flex-col">
             {story.panels.map((panel, index) => (
               <div key={index} className="relative w-full aspect-square border-b-4 border-chiikawa-dark last:border-b-0 group">
                 <img 
                   src={panel.imageUrl} 
                   alt={`Panel ${panel.panelNumber}`}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute top-2 left-2 bg-black/10 text-black/50 font-bold px-2 py-1 text-xs rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                   {index + 1}
                 </div>
                 <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                   <span className="font-bold text-yellow-300">对白:</span> {panel.dialogue || "(无声)"}
                 </div>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* Footer / Branding */}
      <div className="mt-4 flex justify-center">
         <div className="text-chiikawa-text/40 text-xs font-serif italic flex items-center gap-1">
            Chiikawa 漫画生成器制作
            {isStripLayout && <span className="bg-chiikawa-pink/20 text-chiikawa-pink px-1.5 py-0.5 rounded text-[10px] font-bold">V2</span>}
         </div>
      </div>
    </div>
  );
};
