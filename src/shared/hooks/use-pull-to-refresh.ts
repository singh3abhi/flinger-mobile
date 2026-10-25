import { useState } from 'react';

/** Spinner only for a refresh the person asked for (not for background refetches). */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    void refetch().finally(() => setRefreshing(false));
  };
  return { refreshing, onRefresh };
}
