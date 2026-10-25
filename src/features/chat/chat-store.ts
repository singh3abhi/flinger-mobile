import { create } from 'zustand';

/** A message I sent that the server hasn't confirmed yet. */
export interface PendingMessage {
  clientMsgId: string;
  conversationId: string;
  body: string;
  createdAt: string;
  /** sending: on its way (or queued until back online) · failed: tap to retry */
  status: 'sending' | 'failed';
}

interface ChatState {
  pending: Record<string, PendingMessage>;
  /** The thread on screen (its messages don't count as unread). */
  openConversationId: string | null;
  /** conversationId → time until which "typing…" shows. */
  typingUntil: Record<string, number>;
  addPending: (m: PendingMessage) => void;
  setPendingStatus: (clientMsgId: string, status: PendingMessage['status']) => void;
  removePending: (clientMsgId: string) => void;
  setOpen: (conversationId: string | null) => void;
  setTyping: (conversationId: string, until: number) => void;
}

/** Client-only chat state. Server data (messages, conversations) lives in the query cache. */
export const useChatStore = create<ChatState>((set) => ({
  pending: {},
  openConversationId: null,
  typingUntil: {},
  addPending: (m) => set((s) => ({ pending: { ...s.pending, [m.clientMsgId]: m } })),
  setPendingStatus: (id, status) =>
    set((s) => (s.pending[id] ? { pending: { ...s.pending, [id]: { ...s.pending[id], status } } } : s)),
  removePending: (id) =>
    set((s) => {
      if (!s.pending[id]) return s;
      const { [id]: _removed, ...rest } = s.pending;
      return { pending: rest };
    }),
  setOpen: (openConversationId) => set({ openConversationId }),
  setTyping: (conversationId, until) => set((s) => ({ typingUntil: { ...s.typingUntil, [conversationId]: until } })),
}));
