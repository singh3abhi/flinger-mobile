import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { queryKeys } from '@/core/api/query-keys';
import { realtime } from '@/core/realtime';
import { fetchMe } from '@/features/auth';
import type { Message } from './api';
import { applyMessageToList, chatKeys, markListRead, mergeMessages, type ConversationsData, type MessagesData } from './cache';
import { useChatStore } from './chat-store';

const TYPING_SHOWS_MS = 4000;

export function useMyId(): string | undefined {
  return useQuery({ queryKey: queryKeys.me, queryFn: fetchMe }).data?.id;
}

/** Write a confirmed message into every cache that shows it. */
export function useApplyMessage() {
  const queryClient = useQueryClient();
  const myId = useMyId();
  return useCallback((message: Message) => {
    useChatStore.getState().removePending(message.clientMsgId);
    // Their message arrived: they've stopped typing.
    useChatStore.getState().setTyping(message.conversationId, 0);
    queryClient.setQueryData<MessagesData>(chatKeys.messages(message.conversationId), (data) =>
      mergeMessages(data, [message]),
    );
    const open = useChatStore.getState().openConversationId;
    const list = queryClient.getQueryData<ConversationsData>(chatKeys.conversations);
    const next = applyMessageToList(list, message, myId ?? '', open);
    if (next) queryClient.setQueryData(chatKeys.conversations, next);
    else void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
  }, [queryClient, myId]);
}

/** Realtime events → query cache. Mounted once while signed in. */
export function useChatEvents() {
  const queryClient = useQueryClient();
  const applyMessage = useApplyMessage();

  useEffect(() => {
    const offs = [
      realtime.on('message:new', (payload) => applyMessage(payload as Message)),
      realtime.on('match:new', () => {
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
        void queryClient.invalidateQueries({ queryKey: queryKeys.matches });
        void queryClient.invalidateQueries({ queryKey: queryKeys.likesReceived });
      }),
      realtime.on('match:ended', (payload) => {
        const { matchId } = payload as { matchId: string };
        queryClient.removeQueries({ queryKey: chatKeys.messages(matchId) });
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
        void queryClient.invalidateQueries({ queryKey: queryKeys.matches });
      }),
      realtime.on('typing', (payload) => {
        const { conversationId } = payload as { conversationId: string };
        useChatStore.getState().setTyping(conversationId, Date.now() + TYPING_SHOWS_MS);
      }),
      realtime.on('read', (payload) => {
        // I read it on another device.
        const { conversationId } = payload as { conversationId: string };
        queryClient.setQueryData<ConversationsData>(chatKeys.conversations, (d) => markListRead(d, conversationId));
      }),
      realtime.on('reconnected', () => {
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [queryClient, applyMessage]);
}
