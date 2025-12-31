import { GoogleGenAI } from "@google/genai";
import { ChiikawaCharacter, ComicStory, GeminiResponse } from '../types';

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

export const generateChiikawaStory = async (
  apiKey: string,
  userPrompt: string, 
  characters: ChiikawaCharacter[],
  uploadedImage: string | null,
  stylePrompt: string,
  storyFrameworkPrompt: string,
  layoutPrompt: string
): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-pro-image-preview';

    const charDescriptions = characters.map(getCharacterVisualDescription).join(', ');

    const fullPrompt = `
      You are an expert manga artist.
      **Task:** Create a high-quality digital illustration based on the following requirements.
      
      **Layout & Format:**
      - ${layoutPrompt}
      - The output must be ONE SINGLE IMAGE file.

      **Art Style:**
      - ${stylePrompt}

      **Main Characters:**
      - ${charDescriptions}.

      **User's Scenario:**
      - ${userPrompt}

      **Story/Content:**
      - ${storyFrameworkPrompt}

      **Image Reference:**
      - ${uploadedImage ? "An image has been provided. Use it as a PRIMARY reference. The story should continue from the image, or incorporate the characters, objects, or style from the image into the world." : ""}
      
      **Technical Rules:**
      1.  **Output:** Generate only the image.
      2.  **Consistency:** Ensure character details are accurate.
      3.  **Text:** If there is dialogue, use Chinese text in speech bubbles. Keep text legible.
    `;

    const contentParts: any[] = [];
    if (uploadedImage) {
      const [mimeType, base64Data] = uploadedImage.split(';base64,');
      contentParts.push({
        inlineData: {
          mimeType: mimeType.replace('data:', ''),
          data: base64Data,
        },
      });
    }
    console.log("fullPrompt", fullPrompt)
    contentParts.push({ text: fullPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts: contentParts },
      config: {
        imageConfig: { aspectRatio: "9:16" } // Keeping 9:16 for vertical phone screen suitability for both strips and posters
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

    if (!imageUrl) {
      throw new Error("无法生成漫画图片，模型可能没有返回图像。");
    }

    const story: ComicStory = {
      id: Date.now().toString(),
      prompt: userPrompt,
      characters: characters,
      panels: [{
        panelNumber: 1, // Represents the whole strip/poster
        imageUrl,
        visualDescription: "Full generated image",
        dialogue: "Generated content"
      }],
      timestamp: Date.now(),
      layout: 'strip'
    };

    return { story };

  } catch (error) {
    console.error("Gemini Story Generation Error:", error);
    let errorMessage = '发生未知错误';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // Provide more specific feedback for common errors
    if (errorMessage.includes('400')) {
        errorMessage = '请求无效，可能是图片格式或提示有问题。';
    } else if (errorMessage.includes('403')) {
        errorMessage = 'API Key 无效或没有权限。';
    } else if (errorMessage.includes('500')) {
        errorMessage = '服务器端发生错误，请稍后重试。';
    }
    return { error: errorMessage };
  }
};