import type { Context } from 'telegraf';

import {
  createButton,
  createRoute,
  type RouteApi,
} from '../infrastructure/telegramRouter';

export type WindowId =
  | 'menu'
  | 'chat_settings'
  | 'chat_history_limit'
  | 'chat_interest_interval'
  | 'admin_menu'
  | 'admin_chats'
  | 'admin_chat'
  | 'admin_chat_history_limit'
  | 'admin_chat_interest_interval'
  | 'chat_not_approved'
  | 'no_access'
  | 'chat_approval_request'
  | 'user_access_request';

const b = createButton<WindowId>;
const r = createRoute<WindowId>;

interface WindowActions {
  exportData(ctx: Context): Promise<void> | void;
  resetMemory(ctx: Context): Promise<void> | void;
  requestChatAccess(ctx: Context): Promise<void> | void;
  requestUserAccess(ctx: Context): Promise<void> | void;
  showAdminChats(ctx: Context): Promise<void> | void;
  configHistoryLimit(ctx: Context): Promise<void> | void;
  configInterestInterval(ctx: Context): Promise<void> | void;
}

export function createWindows(actions: WindowActions): RouteApi<WindowId>[] {
  return [
    r('menu', async () => ({
      text: 'Выберите действие:',
      buttons: [
        b({
          text: '📊 Загрузить данные',
          callback: 'export_data',
          action: actions.exportData,
        }),
        b({
          text: '🔄 Сбросить память',
          callback: 'reset_memory',
          action: actions.resetMemory,
        }),
        b({
          text: '⚙️ Настройки',
          callback: 'chat_settings',
          target: 'chat_settings',
        }),
      ],
    })),
    r('chat_settings', async () => ({
      text: 'Выберите настройку:',
      buttons: [
        b({
          text: '🕒 Лимит истории',
          callback: 'config_history_limit',
          action: actions.configHistoryLimit,
        }),
        b({
          text: '✨ Интервал интереса',
          callback: 'config_interest_interval',
          action: actions.configInterestInterval,
        }),
      ],
    })),
    r('chat_history_limit', async () => ({
      text: 'Введите новый лимит истории:',
      buttons: [],
    })),
    r('chat_interest_interval', async () => ({
      text: 'Введите новый интервал интереса:',
      buttons: [],
    })),
    r('admin_menu', async () => ({
      text: 'Выберите действие:',
      buttons: [
        b({
          text: '📊 Загрузить данные',
          callback: 'admin_export_data',
          action: actions.exportData,
        }),
        b({
          text: '💬 Чаты',
          callback: 'admin_chats',
          action: actions.showAdminChats,
        }),
      ],
    })),
    r('admin_chats', async ({ loadData }) => {
      const chats =
        ((await loadData()) as { id: number; title: string }[]) ?? [];
      return {
        text:
          chats.length > 0
            ? 'Выберите чат для управления:'
            : 'Нет доступных чатов',
        buttons: chats.map((chat) =>
          b({
            text: `${chat.title} (${chat.id})`,
            callback: `admin_chat:${chat.id}`,
          })
        ),
      };
    }),
    r('admin_chat', async ({ loadData }) => {
      const { chatId, status } = (await loadData()) as {
        chatId: number;
        status: string;
      };
      return {
        text: `Статус чата ${chatId}: ${status}`,
        buttons: [
          b({
            text: status === 'banned' ? 'Разбанить' : 'Забанить',
            callback:
              status === 'banned'
                ? `chat_unban:${chatId}`
                : `chat_ban:${chatId}`,
          }),
          b({
            text: '🕒 Лимит истории',
            callback: `admin_chat_history_limit:${chatId}`,
          }),
          b({
            text: '✨ Интервал интереса',
            callback: `admin_chat_interest_interval:${chatId}`,
          }),
        ],
      };
    }),
    r('admin_chat_history_limit', async ({ loadData }) => {
      const { chatId } = (await loadData()) as { chatId: number };
      return {
        text: `Введите новый лимит истории для чата ${chatId}:`,
        buttons: [],
      };
    }),
    r('admin_chat_interest_interval', async ({ loadData }) => {
      const { chatId } = (await loadData()) as { chatId: number };
      return {
        text: `Введите новый интервал интереса для чата ${chatId}:`,
        buttons: [],
      };
    }),
    r('chat_not_approved', async () => ({
      text: 'Этот чат не находится в списке разрешённых.',
      buttons: [
        b({
          text: 'Запросить доступ',
          callback: 'chat_request',
          action: actions.requestChatAccess,
        }),
      ],
    })),
    r('no_access', async () => ({
      text: 'Для работы с данными нужен доступ.',
      buttons: [
        b({
          text: '🔑 Запросить доступ',
          callback: 'request_access',
          action: actions.requestUserAccess,
        }),
      ],
    })),
    r('chat_approval_request', async ({ loadData }) => {
      const { name, chatId } = (await loadData()) as {
        name: string;
        chatId: number;
      };
      return {
        text: `${name} запросил доступ`,
        buttons: [
          b({ text: 'Разрешить', callback: `chat_approve:${chatId}` }),
          b({ text: 'Забанить', callback: `chat_ban:${chatId}` }),
        ],
      };
    }),
    r('user_access_request', async ({ loadData }) => {
      const { msg, chatId, userId } = (await loadData()) as {
        msg: string;
        chatId: number;
        userId: number;
      };
      return {
        text: msg,
        buttons: [
          b({ text: 'Одобрить', callback: `user_approve:${chatId}:${userId}` }),
          b({ text: 'Забанить чат', callback: `chat_ban:${chatId}` }),
        ],
      };
    }),
  ];
}
