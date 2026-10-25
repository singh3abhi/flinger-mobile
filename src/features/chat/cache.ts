import type { InfiniteData } from '@tanstack/react-query';
import type { Conversation, ConversationList, Message, MessagePage } from './api';

export type MessagesData = InfiniteData<MessagePage, unknown>;
export type ConversationsData = InfiniteData<ConversationList, unknown>;

export const chatKeys = {
  conversations: ['conversations'] as const,
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,
};

/**
 * Add messages to a thread's cache (pages[0] is the newest page, items oldest-first). Duplicates
 * (same id) are dropped: the socket, the send ack and gap-fill may all deliver the same message.
 */
export function mergeMessages(data: MessagesData | undefined, incoming: readonly Message[]): MessagesData | undefined {
  if (!data || data.pages.length === 0) return data;
  const known = new Set(data.pages.flatMap((p) => p.items.map((m) => m.id)));
  const fresh = incoming.filter((m) => !known.has(m.id));
  if (fresh.length === 0) return data;
  const [newest, ...older] = data.pages;
  const items = [...newest.items, ...fresh].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { ...data, pages: [{ ...newest, items }, ...older] };
}

/** All loaded messages, newest first (for an inverted list). */
export function newestFirst(data: MessagesData | undefined): Message[] {
  if (!data) return [];
  return data.pages.flatMap((p) => [...p.items].reverse());
}

/**
 * A new message in the chat list: becomes the last message, moves the conversation to the top and
 * counts as unread unless I sent it or I'm looking at it.
 * Returns undefined when the conversation isn't loaded (the caller refetches).
 */
export function applyMessageToList(
  data: ConversationsData | undefined,
  message: Message,
  myId: string,
  openConversationId: string | null,
): ConversationsData | undefined {
  if (!data) return data;
  let found: Conversation | undefined;
  const pages = data.pages.map((page) => ({
    ...page,
    items: page.items.filter((c) => {
      if (c.id !== message.conversationId) return true;
      found = c;
      return false;
    }),
  }));
  if (!found) return undefined;
  if (found.lastMessage && found.lastMessage.id >= message.id) return data; // stale or duplicate
  const fromMe = message.senderId === myId;
  const unread = !fromMe && openConversationId !== message.conversationId;
  const updated: Conversation = {
    ...found,
    lastMessage: { id: message.id, body: message.body, fromMe, createdAt: message.createdAt },
    unreadCount: unread ? found.unreadCount + 1 : found.unreadCount,
  };
  const [first, ...rest] = pages;
  const wasUnread = found.unreadCount > 0;
  const unreadConversations = first.unreadConversations + (unread && !wasUnread ? 1 : 0);
  return {
    ...data,
    pages: [{ ...first, unreadConversations, items: [updated, ...first.items] }, ...rest].map((p, i) =>
      i === 0 ? p : { ...p, unreadConversations },
    ),
  };
}

/** I've read a conversation: its unread count goes to zero. */
export function markListRead(data: ConversationsData | undefined, conversationId: string): ConversationsData | undefined {
  if (!data) return data;
  const target = data.pages.flatMap((p) => p.items).find((c) => c.id === conversationId);
  if (!target || target.unreadCount === 0) return data;
  return {
    ...data,
    pages: data.pages.map((p) => ({
      ...p,
      unreadConversations: Math.max(0, p.unreadConversations - 1),
      items: p.items.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c)),
    })),
  };
}
