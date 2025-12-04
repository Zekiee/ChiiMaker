import React, { useState, useEffect } from 'react';
import { generateChiikawaStory } from './services/geminiService';
import { ChiikawaCharacter, ComicStory } from './types';
import { CharacterSelector } from './components/CharacterSelector';
import { ComicStrip } from './components/ComicStrip';
import { Button } from './components/Button';
import { Wand2, KeyRound, Sparkles, LogOut, ArrowRight } from 'lucide-react';

const APP_VERSION = "1.2.1";

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<ChiikawaCharacter[]>([ChiikawaCharacter.CHIIKAWA]);
  
  // Store a list of stories
  const [stories, setStories] = useState<ComicStory[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>(''); // For feedback text
  const [error, setError] = useState<string | null>(null);
  
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [tempApiKey, setTempApiKey] = useState('');

  // Load API key and stories on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('chiikawa_api_key');
    if (storedKey) setApiKey(storedKey);

    const savedStories = localStorage.getItem('chiikawa-stories');
    if (savedStories) {
      try {
        setStories(JSON.parse(savedStories));
      } catch (e) {
        console.error("Failed to parse saved stories");
      }
    }
  }, []);

  // Persist stories (without large image data)
  useEffect(() => {
    try {
      const storiesToPersist = stories.map(story => ({
        ...story,
        panels: story.panels.map(panel => ({
          ...panel,
          imageUrl: '', // Remove large base64 data to avoid storage quota errors
        })),
      }));
      localStorage.setItem('chiikawa-stories', JSON.stringify(storiesToPersist));
    } catch (e) {
      console.error("Failed to save stories to localStorage:", e);
    }
  }, [stories]);

  const handleSaveKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('chiikawa_api_key', tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setTempApiKey('');
    }
  };

  const handleClearKey = () => {
    if (window.confirm("确定要移除 API 密钥吗？")) {
      localStorage.removeItem('chiikawa_api_key');
      setApiKey('');
    }
  };

  const toggleCharacter = (char: ChiikawaCharacter) => {
    setSelectedCharacters(prev => {
      if (prev.includes(char)) {
        const next = prev.filter(c => c !== char);
        return next.length === 0 ? [char] : next; // Prevent empty selection
      } else {
        return [...prev, char];
      }
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setLoadingStage('正在构思故事...');

    try {
      // Small delay to let UI update
      await new Promise(r => setTimeout(r, 100));
      
      const response = await generateChiikawaStory(apiKey, prompt, selectedCharacters);
      
      setLoadingStage('正在绘制漫画...');

      if (response.error) {
        setError(response.error);
      } else if (response.story) {
        setStories(prev => [response.story!, ...prev]);
        setPrompt(''); 
      }
    } catch (err) {
      setError("出错了，请重试。");
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const handleRemoveStory = (id: string) => {
    if (window.confirm("确定要删除这篇漫画吗？")) {
      setStories(prev => prev.filter(s => s.id !== id));
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-chiikawa-pink/20">
            <div className="text-6xl mb-6 animate-bounce-slow">✨</div>
            <h1 className="text-3xl font-serif text-chiikawa-dark font-bold mb-4">Chiikawa 漫画生成器</h1>
            <p className="text-gray-500 mb-8">
              请输入您的 Gemini API Key 以开始创作。<br/>
              <span className="text-xs">我们不会上传您的密钥，仅存储在本地浏览器中。</span>
            </p>
            
            <div className="flex flex-col gap-4">
              <input 
                type="password" 
                placeholder="在此粘贴 API Key..." 
                className="w-full p-4 border-2 border-chiikawa-blue/30 rounded-xl outline-none focus:border-chiikawa-pink transition-colors text-center"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <Button onClick={handleSaveKey} disabled={!tempApiKey.trim()} className="w-full justify-center">
                开始使用 <ArrowRight size={18} />
              </Button>
            </div>

            <div className="mt-6 text-xs text-gray-400">
               还没有 Key? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-chiikawa-pink">在此获取 Gemini API Key</a>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 text-chiikawa-dark font-sans selection:bg-chiikawa-pink selection:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b-4 border-chiikawa-pink/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-chiikawa-pink rounded-full flex items-center justify-center text-2xl animate-bounce-slow">
              🍥
            </div>
            <h1 className="text-xl md:text-3xl font-serif font-bold text-chiikawa-pink tracking-tight truncate">
              Chiikawa 漫画机
            </h1>
            <div className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:block">
              {APP_VERSION}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <div className="hidden md:flex items-center text-xs font-bold text-chiikawa-blue bg-blue-50 px-3 py-1 rounded-full border border-chiikawa-blue gap-2">
                <Sparkles size={12} />
                Gemini 3 Pro
             </div>
             <button 
               onClick={handleClearKey}
               className="p-2 text-gray-400 hover:text-red-400 transition-colors"
               title="移除 API Key"
             >
               <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        
        {/* Intro */}
        <div className="text-center mb-8 max-w-2xl">
          <h2 className="text-4xl font-serif mb-2 text-chiikawa-dark">
            四格漫画生成器
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            选择角色，描述剧情，让 AI 为你创作专属漫画！
          </p>
        </div>

        {/* Generator Form */}
        <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 shadow-xl border-b-8 border-chiikawa-blue/20 mb-12">
          
          <CharacterSelector 
            selectedCharacters={selectedCharacters} 
            onToggle={toggleCharacter} 
          />
          
          <div className="relative mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">
              故事创意 / 剧情场景
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`例如：吉伊卡哇和小八在森林里发现了一个奇怪的按钮，按下后发生了有趣的事情。`}
              className="w-full p-6 bg-chiikawa-bg border-4 border-transparent focus:border-chiikawa-pink rounded-2xl text-lg outline-none transition-all placeholder-gray-300 resize-none min-h-[120px] shadow-inner"
              maxLength={400}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="text-sm text-gray-400 italic order-2 md:order-1 flex gap-2 items-center">
              <span>{loadingStage ? loadingStage : "准备开始创作！"}</span>
              {isGenerating && <span className="animate-spin">🍥</span>}
            </div>
            
            <Button 
              onClick={handleGenerate} 
              isLoading={isGenerating} 
              disabled={!prompt.trim() || selectedCharacters.length === 0}
              className="w-full md:w-auto min-w-[200px] text-lg order-1 md:order-2"
            >
              {isGenerating ? '正在施法...' : (
                <>
                  <Wand2 size={20} />
                  生成漫画
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-xl border border-red-100 flex items-center justify-center gap-2">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Stories Feed */}
        <div className="w-full flex flex-col items-center gap-10">
           {stories.length === 0 && !isGenerating && (
             <div className="opacity-40 flex flex-col items-center">
               <div className="text-6xl mb-4 grayscale">✏️</div>
               <p className="font-serif">还没有漫画，快去创作吧！</p>
             </div>
           )}

           {stories.map(story => (
             <ComicStrip 
               key={story.id} 
               story={story} 
               onRemove={handleRemoveStory} 
             />
           ))}
        </div>

      </main>
    </div>
  );
};

export default App;