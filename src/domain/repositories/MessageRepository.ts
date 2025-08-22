import type { ChatMessage } from '@/domain/messages/ChatMessage';
import type { StoredMessage } from '@/domain/messages/StoredMessage';

export interface MessageRepository {
  insert(message: StoredMessage): Promise<void>;
  findByChatId(chatId: number): Promise<ChatMessage[]>;
  countByChatId(chatId: number): Promise<number>;
  findLastByChatId(chatId: number, limit: number): Promise<ChatMessage[]>;
  clearByChatId(chatId: number): Promise<void>;
}

export const MESSAGE_REPOSITORY_ID = Symbol('MessageRepository');
