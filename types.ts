export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  groundingMetadata?: any;
}

export interface QuickQuestion {
  id: string;
  text: string;
  category: string;
}