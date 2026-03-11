export type InteractionType = 'single' | 'boolean' | 'multiple' | 'text';

export interface InteractionOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface Interaction {
  id: string;
  time: number;
  type: InteractionType;
  question: string;
  options: InteractionOption[];
  textAnswer?: string;
  textMatchMode?: 'exact' | 'includes';
  feedbackCorrect: string;
  feedbackIncorrect: string;
  pauseUntilAnswered: boolean;
  duration?: number;
}

export interface Project {
  id: string;
  title: string;
  sourceType: 'upload' | 'url';
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
  interactions: Interaction[];
}

export interface ProjectsStore {
  projects: Project[];
}
