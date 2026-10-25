import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/core/api/errors';
import { realtime } from '@/core/realtime';
import { fetchMessages, markReadRest, sendMessageRest, type Message } from './api';
import {
  chatKeys,
  markListRead,
  mergeMessages,
  newestFirst,
  type ConversationsData,
  type MessagesData,
} from './cache';
import { useChatStore, type PendingMessage } from './chat-store';
import { useApplyMessage, useMyId } from './use-chat-events';

const TYPING_EVERY_MS = 2000;

/** One conversation: history (paged), sending with retry, read marks, typing, gap-fill. */
export function useThread(conversationId: string) {
  const queryClient = useQueryClient();
  const myId = useMyId();
  const applyMessage = useApplyMessage();
  const lastRead = useRef<string | null>(null);
  const lastTyping = useRef(0);

  const query = useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: ({ pageParam }) => fetchMessages(conversationId, { before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => (page.hasMore ? page.items[0]?.id : undefined),
  });
  const messages = newestFirst(query.data);
  const pending = Object.values(useChatStore((s) => s.pending))
    .filter((p) => p.conversationId === conversationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const typingUntil = useChatStore((s) => s.typingUntil[conversationId] ?? 0);
  // Re-render when "typing…" should disappear.
  const [, setTick] = useState(0);
  useEffect(() => {
    const left = typingUntil - Date.now();
    if (left <= 0) return;
    const timer = setTimeout(() => setTick((n) => n + 1), left + 50);
    return () => clearTimeout(timer);
  }, [typingUntil]);

  // This thread is on screen: its new messages aren't unread.
  useEffect(() => {
    useChatStore.getState().setOpen(conversationId);
    return () => useChatStore.getState().setOpen(null);
  }, [conversationId]);

  const deliver = useCallback(
    async (p: PendingMessage) => {
      const { setPendingStatus } = useChatStore.getState();
      setPendingStatus(p.clientMsgId, 'sending');
      try {
        if (realtime.connected) {
          const ack = await realtime.request('message:send', {
            conversationId,
            clientMsgId: p.clientMsgId,
            body: p.body,
          });
          if (ack.ok) return applyMessage(ack.message as Message);
          setPendingStatus(p.clientMsgId, 'failed');
          return;
        }
        applyMessage(await sendMessageRest(conversationId, p.clientMsgId, p.body));
      } catch (error) {
        // Offline: stay "sending" and go out on reconnect. Anything else: tap to retry.
        const offline = error instanceof ApiError ? error.isNetwork : true;
        if (!offline) setPendingStatus(p.clientMsgId, 'failed');
      }
    },
    [conversationId, applyMessage],
  );

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    const p: PendingMessage = {
      clientMsgId: randomUUID(),
      conversationId,
      body,
      createdAt: new Date().toISOString(),
      status: 'sending',
    };
    useChatStore.getState().addPending(p);
    void deliver(p);
  };

  const retry = (clientMsgId: string) => {
    const p = useChatStore.getState().pending[clientMsgId];
    if (p) void deliver(p);
  };

  const typing = () => {
    const now = Date.now();
    if (now - lastTyping.current < TYPING_EVERY_MS) return;
    lastTyping.current = now;
    realtime.emit('typing', { conversationId });
  };

  // Read up to the newest message from them.
  const newestFromThem = messages.find((m) => m.senderId !== myId)?.id;
  useEffect(() => {
    if (!newestFromThem || lastRead.current === newestFromThem) return;
    lastRead.current = newestFromThem;
    queryClient.setQueryData<ConversationsData>(chatKeys.conversations, (d) => markListRead(d, conversationId));
    const mark = realtime.connected
      ? realtime.request('read', { conversationId, upToMessageId: newestFromThem })
      : markReadRest(conversationId, newestFromThem);
    void Promise.resolve(mark).catch(() => {
      lastRead.current = null;
    });
  }, [newestFromThem, conversationId, queryClient]);

  // Back online: fetch what we missed and send what's waiting.
  const newestId = messages[0]?.id;
  useEffect(
    () =>
      realtime.on('reconnected', () => {
        if (newestId) {
          void fetchMessages(conversationId, { after: newestId }).then((page) =>
            queryClient.setQueryData(chatKeys.messages(conversationId), (d: MessagesData | undefined) =>
              mergeMessages(d, page.items),
            ),
          );
        }
        for (const p of Object.values(useChatStore.getState().pending)) {
          if (p.conversationId === conversationId && p.status === 'sending') void deliver(p);
        }
      }),
    [conversationId, newestId, queryClient, deliver],
  );

  return {
    messages,
    pending,
    myId,
    isTyping: typingUntil > Date.now(),
    loading: query.isPending,
    error: query.error,
    closed: query.error instanceof ApiError && query.error.code === 'CONVERSATION_NOT_FOUND',
    loadOlder: () => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage(),
    send,
    retry,
    typing,
  };
}
