import { inject, injectable } from 'inversify';

import type { Logger } from '@/application/interfaces/logging/Logger.interface';
import {
  LOGGER_FACTORY_ID,
  type LoggerFactory,
} from '@/application/interfaces/logging/LoggerFactory.interface';
import type { MessageService } from '@/application/interfaces/messages/MessageService.interface';
import { ChatEntity } from '@/domain/entities/ChatEntity';
import { UserEntity } from '@/domain/entities/UserEntity';
import type { ChatMessage } from '@/domain/messages/ChatMessage.interface';
import type { StoredMessage } from '@/domain/messages/StoredMessage.interface';
import {
  CHAT_REPOSITORY_ID,
  type ChatRepository,
} from '@/domain/repositories/ChatRepository.interface';
import {
  CHAT_USER_REPOSITORY_ID,
  type ChatUserRepository,
} from '@/domain/repositories/ChatUserRepository.interface';
import {
  MESSAGE_REPOSITORY_ID,
  type MessageRepository,
} from '@/domain/repositories/MessageRepository.interface';
import {
  USER_REPOSITORY_ID,
  type UserRepository,
} from '@/domain/repositories/UserRepository.interface';

@injectable()
export class RepositoryMessageService implements MessageService {
  private readonly logger: Logger;
  constructor(
    @inject(CHAT_REPOSITORY_ID) private chatRepo: ChatRepository,
    @inject(USER_REPOSITORY_ID) private userRepo: UserRepository,
    @inject(MESSAGE_REPOSITORY_ID) private messageRepo: MessageRepository,
    @inject(CHAT_USER_REPOSITORY_ID) private chatUserRepo: ChatUserRepository,
    @inject(LOGGER_FACTORY_ID) private loggerFactory: LoggerFactory
  ) {
    this.logger = this.loggerFactory.create('RepositoryMessageService');
  }

  async addMessage(message: StoredMessage): Promise<void> {
    this.logger.debug(
      {
        chatId: message.chatId,
        role: message.role,
      },
      'Inserting message into database'
    );
    const storedUserId = message.userId ?? 0;
    const chat = new ChatEntity(message.chatId, message.chatTitle ?? null);
    await this.chatRepo.upsert(chat);
    const user = new UserEntity(
      storedUserId,
      message.username ?? null,
      message.firstName ?? null,
      message.lastName ?? null
    );
    await this.userRepo.upsert(user);
    await this.chatUserRepo.link(message.chatId, storedUserId);
    await this.messageRepo.insert({
      ...message,
      userId: storedUserId,
    });
  }

  async getMessages(chatId: number): Promise<ChatMessage[]> {
    this.logger.debug({ chatId }, 'Fetching messages from database');
    return this.messageRepo.findByChatId(chatId);
  }

  async getCount(chatId: number): Promise<number> {
    this.logger.debug({ chatId }, 'Counting messages in database');
    return this.messageRepo.countByChatId(chatId);
  }

  async getLastMessages(chatId: number, limit: number): Promise<ChatMessage[]> {
    this.logger.debug(
      {
        chatId,
        limit,
      },
      'Fetching last messages from database'
    );
    return this.messageRepo.findLastByChatId(chatId, limit);
  }

  async clearMessages(chatId: number): Promise<void> {
    this.logger.debug({ chatId }, 'Clearing messages table');
    await this.messageRepo.clearByChatId(chatId);
  }
}
