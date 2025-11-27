export enum ChiikawaCharacter {
  CHIIKAWA = 'Chiikawa',
  HACHIWARE = 'Hachiware',
  USAGI = 'Usagi',
  MOMONGA = 'Momonga',
  KURIMANJU = 'Kurimanju',
  RAKKO = 'Rakko',
}

export enum ChiikawaStyle {
  STANDARD = 'Standard',
  EATING = 'Eating',
  CRYING = 'Crying',
  SLEEPY = 'Sleepy',
  CHAOTIC = 'Chaotic',
}

export interface ComicPanel {
  panelNumber: number;
  imageUrl: string;
  visualDescription: string;
  dialogue: string;
}

export interface ComicStory {
  id: string;
  prompt: string;
  characters: ChiikawaCharacter[];
  panels: ComicPanel[];
  timestamp: number;
  layout?: 'grid' | 'strip'; // 'grid' = 4 separate images, 'strip' = 1 combined image
}

export interface GeminiResponse {
  story?: ComicStory;
  error?: string;
}