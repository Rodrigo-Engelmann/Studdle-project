import { MascotOutcome } from '../enums/mascot.enums';

export interface MascotPosition {
  x: number;
  y: number;
}

export interface MascotStep {
  image: string;
  pos: MascotPosition;
  message: string;
  name: string;
}

export interface MascotConfig {
  steps: MascotStep[];
  hint?: string;
  mascotSize?: string;
  gap?: string;
  allowSkip?: boolean;
}

export interface MascotResult {
  outcome: MascotOutcome;
  stepsSeen: number;
  totalSteps: number;
}
