import { notifyBlocked, onPersonBlocked } from './blocked-events';

describe('blocked events', () => {
  it('tells listeners until they unsubscribe', () => {
    const seen: string[] = [];
    const off = onPersonBlocked((id) => seen.push(id));
    notifyBlocked('a');
    off();
    notifyBlocked('b');
    expect(seen).toEqual(['a']);
  });
});
