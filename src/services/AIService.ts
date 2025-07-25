export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  username?: string;
}

export interface AIService {
  ask(history: ChatMessage[], summary?: string): Promise<string>;
  summarize(history: ChatMessage[], prev?: string): Promise<string>;
}
