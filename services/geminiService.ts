import { GoogleGenAI, Type } from "@google/genai";
import { ChiikawaCharacter, ComicStory, ComicPanel, GeminiResponse } from '../types';

// Helper to get physical descriptions for the image generator
const getCharacterVisualDescription = (character: ChiikawaCharacter): string => {
  switch (character) {
    case ChiikawaCharacter.CHIIKAWA:
      return "Chiikawa (small white round creature, cute bear-like, small eyebrows, pink cheeks)";
    case ChiikawaCharacter.HACHIWARE:
      return "Hachiware (white cat-like creature with blue ears and blue hachi-pattern hair on head)";
    case ChiikawaCharacter.USAGI:
      return "Usagi (yellow rabbit-like creature, long ears, donut tail)";
    case ChiikawaCharacter.MOMONGA:
      return "Momonga (flying squirrel, white face, big blue eyes, bushy tail)";
    case ChiikawaCharacter.KURIMANJU:
      return "Kurimanju (brown otter-like face, serious expression)";
    case ChiikawaCharacter.RAKKO:
      return "Rakko (sea otter, white cape, hero scar on face)";
    default:
      return character;
  }
};

interface ScriptPanel {
  panel_number: number;
  visual_description: string;
  dialogue: string;
}

// Step 1: Generate the script
const generateComicScript = async (ai: GoogleGenAI, characters: ChiikawaCharacter[], userPrompt: string): Promise<ScriptPanel[]> => {
  const model = 'gemini-3-pro-preview';
  
  const characterNames = characters.join(', ');
  
  const prompt = `You are a manga writer for the "Chiikawa" series.
  Characters: ${characterNames}.
  Scenario: ${userPrompt}.
  
  Create a funny, cute, or chaotic 4-panel comic script (4-koma).
  
  Structure:
  Panel 1: Introduction/Setup.
  Panel 2: Development/Action.
  Panel 3: Twist/Chaos.
  Panel 4: Punchline/Conclusion.
  
  For each panel, provide:
  1. visual_description: A highly detailed English description for an AI image generator. Describe the characters' poses, expressions, and the background. Mention the art style: 'Chiikawa style, hand-drawn lines'.
  2. dialogue: The exact text for the speech bubble. Keep it brief (under 10 chars, use Chinese). If silence/sound effect only, leave empty.
  
  Return ONLY the JSON array.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            panel_number: { type: Type.INTEGER },
            visual_description: { type: Type.STRING },
            dialogue: { type: Type.STRING },
          },
          required: ['panel_number', 'visual_description', 'dialogue'],
        }
      }
    }
  });

  if (!response.text) throw new Error("无法生成脚本");
  return JSON.parse(response.text) as ScriptPanel[];
};

// Step 2: Generate the FULL STRIP image
const generateFullStripImage = async (ai: GoogleGenAI, script: ScriptPanel[], characters: ChiikawaCharacter[]): Promise<ComicPanel> => {
  const model = 'gemini-3-pro-image-preview';
  
  // Combine all character visual descriptions
  const charDescriptions = characters.map(getCharacterVisualDescription).join(', ');

  // Construct a prompt that describes the layout and each panel
  const panelsPrompt = script.map(p => {
    const dialogueInstruction = p.dialogue 
      ? `speech bubble saying "${p.dialogue}"` 
      : "no speech bubble";
    return `Panel ${p.panel_number}: ${p.visual_description}, ${dialogueInstruction}`;
  }).join('\n');

  const imagePrompt = `
    Create a vertical 4-panel comic strip (4-koma manga) on a single image.
    Style: Official Chiikawa anime art style. Hand-drawn, shaky lines, soft pastel colors (pink, white, blue), cute, minimalist background.
    Characters: ${charDescriptions}.
    
    Layout: The image is vertically divided into 4 equal square panels (top to bottom).
    
    Content:
    ${panelsPrompt}
    
    Ensure the characters look consistent across all panels.
    Ensure text in speech bubbles is legible.
    High quality digital illustration.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: imagePrompt }] },
    config: {
      imageConfig: { aspectRatio: "9:16" } // Vertical strip aspect ratio
    }
  });

  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.data) {
        imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) throw new Error(`无法生成漫画图片`);

  return {
    panelNumber: 1, // Represents the whole strip
    imageUrl,
    visualDescription: "Full 4-panel strip",
    dialogue: "Full story"
  };
};

export const generateChiikawaStory = async (
  apiKey: string,
  userPrompt: string, 
  characters: ChiikawaCharacter[]
): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Generate Script
    const script = await generateComicScript(ai, characters, userPrompt);
    
    // 2. Generate Single Image Strip (9:16 aspect ratio)
    // We strictly use the first 4 panels from the script if more are returned
    const limitedScript = script.slice(0, 4);
    
    const fullStripPanel = await generateFullStripImage(ai, limitedScript, characters);

    const story: ComicStory = {
      id: Date.now().toString(),
      prompt: userPrompt,
      characters: characters,
      panels: [fullStripPanel], // Only one "panel" which is the full image
      timestamp: Date.now(),
      layout: 'strip'
    };

    return { story };

  } catch (error) {
    console.error("Gemini Story Generation Error:", error);
    return { error: error instanceof Error ? error.message : '发生未知错误' };
  }
};