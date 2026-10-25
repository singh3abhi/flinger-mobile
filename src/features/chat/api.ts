import { api } from '@/core/api/client';
import { ensureOk, unwrap } from '@/core/api/errors';
import type {
  SchemaConversationListDto,
  SchemaMessageDto,
  SchemaMessagePageDto,
} from '@/core/api/schema';

export type ConversationList = SchemaConversationListDto;
export type Conversation = SchemaConversationListDto['items'][number];
export type Message = SchemaMessageDto;
export type MessagePage = SchemaMessagePageDto;

export async function fetchConversations(cursor?: string): Promise<ConversationList> {
  return unwrap(await api.GET('/v1/conversations', { params: { query: { limit: 30, cursor } } }));
}

export async function fetchMessages(
  conversationId: string,
  page: { before?: string; after?: string } = {},
): Promise<MessagePage> {
  return unwrap(
    await api.GET('/v1/conversations/{conversationId}/messages', {
      params: { path: { conversationId }, query: { limit: 30, ...page } },
    }),
  );
}

export async function sendMessageRest(conversationId: string, clientMsgId: string, body: string) {
  return unwrap(
    await api.POST('/v1/conversations/{conversationId}/messages', {
      params: { path: { conversationId } },
      body: { clientMsgId, body },
    }),
  );
}

export async function markReadRest(conversationId: string, upToMessageId: string): Promise<void> {
  ensureOk(
    await api.POST('/v1/conversations/{conversationId}/read', {
      params: { path: { conversationId } },
      body: { upToMessageId },
    }),
  );
}

export async function unmatch(matchId: string): Promise<void> {
  ensureOk(await api.DELETE('/v1/matches/{matchId}', { params: { path: { matchId } } }));
}
