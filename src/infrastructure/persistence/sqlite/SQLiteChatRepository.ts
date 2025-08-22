import { inject, injectable } from 'inversify';

import { ChatEntity } from '@/domain/entities/ChatEntity';
import type { ChatRepository } from '@/domain/repositories/ChatRepository';
import {
  DB_PROVIDER_ID,
  type DbProvider,
} from '@/domain/repositories/DbProvider';

@injectable()
export class SQLiteChatRepository implements ChatRepository {
  constructor(
    @inject(DB_PROVIDER_ID) private readonly dbProvider: DbProvider
  ) {}
  async upsert({ chatId, title }: ChatEntity): Promise<void> {
    const db = await this.dbProvider.get();
    await db.run(
      'INSERT INTO chats (chat_id, title) VALUES (?, ?) ON CONFLICT(chat_id) DO UPDATE SET title=excluded.title',
      chatId,
      title ?? null
    );
  }

  async findById(chatId: number): Promise<ChatEntity | undefined> {
    const db = await this.dbProvider.get();
    const row = await db.get<{ chat_id: number; title: string | null }>(
      'SELECT chat_id, title FROM chats WHERE chat_id = ?',
      chatId
    );
    return row ? new ChatEntity(row.chat_id, row.title) : undefined;
  }
}
