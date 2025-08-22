import type { ChatMessage } from '@/domain/messages/ChatMessage';
import type { StoredMessage } from '@/domain/messages/StoredMessage';

export interface ChatMemory {
  addMessage(message: StoredMessage): Promise<void>;
  getHistory(): Promise<ChatMessage[]>;
}
