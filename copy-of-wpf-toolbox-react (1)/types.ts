export interface BmiRecord {
  name: string;
  bmi: string;
  status: string;
  time: string;
}

export type SectionType = 
  | 'intro' 
  | 'bmi' 
  | 'tetris' 
  | 'tetris-fun' 
  | 'calculator'
  | 'match3'
  | 'spider'
  | 'flappy';

export interface TetrisStats {
  score: number;
  level: number;
  lines: number;
}