export interface StoryTurn {
  id: string;
  sceneDescription: string;
  imageBase64: string | null;
  options: string[];
  userChoice?: string; // The choice made to get to the NEXT state (undefined for current)
}

export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR',
}

export interface GameContext {
  history: StoryTurn[];
  currentState: GameState;
}

export interface GenAIResponse {
  sceneDescription: string;
  imagePrompt: string;
  options: string[];
}

export interface World {
  id: string;
  title: string;
  createdAt: number;
  lastPlayedAt: number;
  history: StoryTurn[];
  currentTurn: StoryTurn | null;
  previewText: string;
}