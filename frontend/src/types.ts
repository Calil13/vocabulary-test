export type Direction = 'AZ_TO_EN' | 'EN_TO_AZ';

export type LevelCode = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Option {
  id: number;
  text: string;
}

export interface Question {
  wordId: number;
  direction: Direction;
  question: string;
  options: Option[];
}

export interface AnswerResult {
  correct: boolean;
  correctWordId: number;
  correctText: string;
}
