import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/core/api/client';
import { ApiError, ensureOk } from '@/core/api/errors';
import { queryKeys } from '@/core/api/query-keys';
import { fetchMe } from '@/features/auth';
import { onPersonBlocked } from '@/features/safety';
import {
  fetchDeck,
  fetchLimits,
  fetchMyProfile,
  sendLike,
  sendPass,
  type LikeInput,
  type LikeResult,
  type PublicProfile,
} from './api';

/** Fetch more when this few cards are left. */
const LOW_WATER = 2;

/** My own main photo (for the match screen). */
export function useMyMainPhoto(): string | undefined {
  const mine = useQuery({ queryKey: queryKeys.myProfile, queryFn: fetchMyProfile });
  return mine.data?.photos[0]?.url ?? undefined;
}

export function useLimits() {
  return useQuery({ queryKey: queryKeys.limits, queryFn: fetchLimits });
}

const isPausedError = (e: unknown) => e instanceof ApiError && e.code === 'ACCOUNT_PAUSED';

/**
 * The Discover queue. The server pops cards as it serves them, so this keeps a local queue and
 * tops it up when it runs low; the head of the queue is the card on screen. While my account is
 * paused there is no queue; pausing or unpausing (here or in Settings) starts it over.
 */
export function useDeck() {
  const queryClient = useQueryClient();
  const status = useQuery({ queryKey: queryKeys.me, queryFn: fetchMe }).data?.status;
  const paused = status === 'paused';
  const [cards, setCards] = useState<PublicProfile[]>([]);
  const [meta, setMeta] = useState<{ radiusKm: number; widened: boolean } | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  const loadMore = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const deck = await fetchDeck(10);
      setMeta({ radiusKm: deck.radiusKm, widened: deck.widened });
      setExhausted(deck.items.length === 0);
      setCards((current) => {
        const known = new Set(current.map((c) => c.userId));
        return [...current, ...deck.items.filter((c) => !known.has(c.userId))];
      });
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  /** Start again from the server (e.g. "Check again" on the empty state). */
  const reload = useCallback(() => {
    setCards([]);
    setExhausted(false);
    setError(null);
  }, []);

  const lastStatus = useRef(status);
  useEffect(() => {
    if (lastStatus.current !== undefined && lastStatus.current !== status) reload();
    lastStatus.current = status;
  }, [status, reload]);

  useEffect(() => {
    if (status !== undefined && !paused && cards.length <= LOW_WATER && !exhausted && !error) void loadMore();
  }, [status, paused, cards.length, exhausted, error, loadMore]);

  // Someone I blocked (here or from the report screen) leaves the queue.
  useEffect(() => onPersonBlocked((id) => setCards((current) => current.filter((c) => c.userId !== id))), []);

  /** Drop the card on screen (after a like or pass). */
  const advance = useCallback(() => setCards((current) => current.slice(1)), []);

  /** Show my profile again (Discover's paused state). */
  const unpause = useCallback(async () => {
    ensureOk(await api.DELETE('/v1/me/pause'));
    reload();
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  }, [queryClient, reload]);

  const showPaused = paused || (cards.length === 0 && isPausedError(error));
  return {
    current: showPaused ? null : (cards[0] ?? null),
    upcoming: showPaused ? [] : cards.slice(1),
    meta,
    paused: showPaused,
    loading: !showPaused && (status === undefined || loading) && cards.length === 0,
    exhausted: exhausted && cards.length === 0,
    error: cards.length === 0 && !showPaused ? error : null,
    advance,
    reload,
    unpause,
  };
}

/** Like and pass, keeping the likes-left pill in sync. */
export function useDecisions() {
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: (input: LikeInput) => sendLike(input),
    onSuccess: (result: LikeResult) => {
      queryClient.setQueryData(queryKeys.limits, (old: { likesPerDay: number } | undefined) =>
        old
          ? {
              ...old,
              likesRemaining: result.likesRemaining,
              likesUsed: old.likesPerDay - result.likesRemaining,
              resetsAt: result.resetsAt,
            }
          : old,
      );
      if (result.matched) void queryClient.invalidateQueries({ queryKey: queryKeys.matches });
      void queryClient.invalidateQueries({ queryKey: queryKeys.likesReceived });
    },
  });

  const pass = useMutation({
    mutationFn: (targetId: string) => sendPass(targetId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.likesReceived }),
  });

  return {
    like,
    pass,
    isLimitError: (error: unknown) => error instanceof ApiError && error.code === 'LIKE_LIMIT_REACHED',
  };
}
