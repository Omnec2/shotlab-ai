
export enum View {
  HOME = 'home',
  DASHBOARD = 'dashboard',
  SCRIPT = 'script',
  BREAKDOWN = 'breakdown',
  STORYBOARD = 'storyboard',
  ACCOUNT = 'account',
  TRASH = 'trash'
}

export type Language = 'fr' | 'en';

export interface Shot {
  id: number;
  shotType: string;
  angle: string;
  axis: string;
  movement: string;
  sound: string;
  dialogue: string;
  description: string;
  visualPrompt: string;
  imageUrl?: string;
}

export interface DPNotes {
  lighting: string;
  colors: string;
  sound: string;
}

export interface Sequence {
  id: string;
  number: number;
  title: string;
  script: string;
  shots: Shot[];
  dpNotes: DPNotes | null;
}

export interface Project {
  id: string;
  name: string;
  sequences: Sequence[];
  style: string;
  pitch?: string;
  customStyle?: string;
  updatedAt: number;
  ownerId: string;
  isDeleted?: boolean;
  deletedAt?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  projects: Project[];
  password?: string;
  avatarUrl?: string;
  credits: number;
  isVip: boolean;
}

export interface DirectorStyle {
  id: string;
  label: string;
  desc: string;
}
