type Listener = (userId: string) => void;

const listeners = new Set<Listener>();

/**
 * Screens that keep people in local state (the Discover queue) hear about a block here, wherever
 * it happened (the options sheet or the report screen), and drop that person.
 */
export function onPersonBlocked(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyBlocked(userId: string): void {
  for (const listener of listeners) listener(userId);
}
