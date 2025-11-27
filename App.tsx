import React, { useState, useEffect } from 'react';
import { generateChiikawaStory } from './services/geminiService';
import { ChiikawaCharacter, ComicStory } from './types';
import { CharacterSelector } from './components/CharacterSelector';
import { ComicStrip } from './components/ComicStrip';
import { Button } from './components/Button';
import { Wand2, KeyRound, Eraser, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<ChiikawaCharacter[]>([ChiikawaCharacter.CHIIKAWA]);
  
  // Store a list of stories instead of single panels
  const [stories, setStories] = useState<ComicStory[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>(''); // For feedback text
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
       // @ts-ignore
       await window.aistudio.openSelectKey();
       setHasApiKey(true);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('chiikawa-stories');
    if (saved) {
      try {
        setStories(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved stories");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chiikawa-stories', JSON.stringify(stories));
  }, [stories]);

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
    setLoadingStage('Writing Story...');

    try {
      // Small delay to let UI update
      await new Promise(r => setTimeout(r, 100));
      
      const response = await generateChiikawaStory(prompt, selectedCharacters);
      
      setLoadingStage('Drawing Panels...');

      if (response.error) {
        if (response.error.includes("Requested entity was not found")) {
            setHasApiKey(false);
            setError("Session expired or invalid key. Please select your API key again.");
        } else {
            setError(response.error);
        }
      } else if (response.story) {
        setStories(prev => [response.story!, ...prev]);
        setPrompt(''); 
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const handleRemoveStory = (id: string) => {
    if (window.confirm("Delete this comic strip?")) {
      setStories(prev => prev.filter(s => s.id !== id));
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border-4 border-chiikawa-pink/20">
            <div className="text-6xl mb-6 animate-bounce-slow">✨</div>
            <h1 className="text-3xl font-serif text-chiikawa-dark font-bold mb-4">Chiikawa Maker</h1>
            <p className="text-gray-500 mb-8">
              To use the high-quality <b>Gemini 3 Pro</b> models for story and art generation, please select a paid API key.
            </p>
            <Button onClick={handleSelectKey} className="w-full justify-center">
              <KeyRound size={20} />
              Select API Key
            </Button>
            <div className="mt-6 text-xs text-gray-400">
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-chiikawa-pink">
                 Billing Information
               </a>
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
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-chiikawa-pink tracking-tight">
              ChiiMaker
            </h1>
          </div>
          <div className="hidden md:flex items-center text-xs font-bold text-chiikawa-blue bg-blue-50 px-3 py-1 rounded-full border border-chiikawa-blue gap-2">
             <Sparkles size={12} />
             Gemini 3 Pro + Image Preview
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col items-center">
        
        {/* Intro */}
        <div className="text-center mb-8 max-w-2xl">
          <h2 className="text-4xl font-serif mb-2 text-chiikawa-dark">
            4-Panel Comic Generator
          </h2>
          <p className="text-lg text-gray-500 font-medium">
            Pick characters, describe a situation, and let AI write & draw the manga!
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
              Story Idea / Scenario
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`e.g. Chiikawa and Hachiware find a strange button in the forest. When they press it, something funny happens.`}
              className="w-full p-6 bg-chiikawa-bg border-4 border-transparent focus:border-chiikawa-pink rounded-2xl text-lg outline-none transition-all placeholder-gray-300 resize-none min-h-[120px] shadow-inner"
              maxLength={400}
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="text-sm text-gray-400 italic order-2 md:order-1 flex gap-2 items-center">
              <span>{loadingStage ? loadingStage : "Ready to create!"}</span>
              {isGenerating && <span className="animate-spin">🍥</span>}
            </div>
            
            <Button 
              onClick={handleGenerate} 
              isLoading={isGenerating} 
              disabled={!prompt.trim() || selectedCharacters.length === 0}
              className="w-full md:w-auto min-w-[200px] text-lg order-1 md:order-2"
            >
              {isGenerating ? 'Making Magic...' : (
                <>
                  <Wand2 size={20} />
                  Generate Comic
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
               <p className="font-serif">No comics yet. Start writing!</p>
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
