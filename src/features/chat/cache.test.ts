import { applyMessageToList, markListRead, mergeMessages, newestFirst, type ConversationsData, type MessagesData } from './cache';
import type { Conversation, Message } from './api';

const msg = (id: string, senderId = 'them', conversationId = 'c1'): Message => ({
  id,
  conversationId,
  senderId,
  body: `body ${id}`,
  clientMsgId: `client-${id}`,
  createdAt: '2026-10-26T10:00:00.000Z',
});

const thread = (items: Message[], older: Message[] = []): MessagesData => ({
  pages: [
    { items, hasMore: older.length > 0 },
    ...(older.length ? [{ items: older, hasMore: false }] : []),
  ],
  pageParams: [undefined, ...(older.length ? [items[0]?.id] : [])],
});

const conversation = (id: string, unreadCount = 0, lastId?: string): Conversation => ({
  id,
  member: { userId: `u-${id}`, displayName: id, age: 28, city: null, photoUrl: 'https://x/p.jpg' },
  matchedAt: '2026-10-25T10:00:00.000Z',
  lastMessage: lastId ? { id: lastId, body: 'b', fromMe: false, createdAt: '2026-10-25T10:00:00.000Z' } : null,
  unreadCount,
});

const list = (items: Conversation[], unreadConversations = 0): ConversationsData => ({
  pages: [{ items, nextCursor: null, unreadConversations }],
  pageParams: [undefined],
});

describe('chat cache', () => {
  it('adds new messages in id order and ignores duplicates', () => {
    const data = thread([msg('02'), msg('04')], [msg('01')]);
    const merged = mergeMessages(data, [msg('03'), msg('04'), msg('05')]);
    expect(merged?.pages[0].items.map((m) => m.id)).toEqual(['02', '03', '04', '05']);
    expect(mergeMessages(merged, [msg('05')])).toBe(merged);
    expect(newestFirst(merged).map((m) => m.id)).toEqual(['05', '04', '03', '02', '01']);
  });

  it('moves a conversation to the top with the new last message and unread count', () => {
    const data = list([conversation('a', 0, '01'), conversation('c1', 0, '02')]);
    const next = applyMessageToList(data, msg('03'), 'me', null);
    expect(next?.pages[0].items.map((c) => c.id)).toEqual(['c1', 'a']);
    expect(next?.pages[0].items[0]).toMatchObject({
      lastMessage: { id: '03', fromMe: false },
      unreadCount: 1,
    });
    expect(next?.pages[0].unreadConversations).toBe(1);
  });

  it('does not count my own messages, or messages in the open thread, as unread', () => {
    const data = list([conversation('c1')]);
    expect(applyMessageToList(data, msg('03', 'me'), 'me', null)?.pages[0].items[0].unreadCount).toBe(0);
    expect(applyMessageToList(data, msg('03'), 'me', 'c1')?.pages[0].items[0].unreadCount).toBe(0);
  });

  it('asks for a refetch when the conversation is not loaded, and ignores stale messages', () => {
    expect(applyMessageToList(list([conversation('a')]), msg('03'), 'me', null)).toBeUndefined();
    const data = list([conversation('c1', 0, '05')]);
    expect(applyMessageToList(data, msg('03'), 'me', null)).toBe(data);
  });

  it('marks a conversation read', () => {
    const data = list([conversation('c1', 3)], 1);
    const read = markListRead(data, 'c1');
    expect(read?.pages[0].items[0].unreadCount).toBe(0);
    expect(read?.pages[0].unreadConversations).toBe(0);
  });
});
