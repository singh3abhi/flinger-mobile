const mockHandlers: Record<string, (arg?: unknown) => void> = {};
const mockSocket = {
  connected: false,
  on: jest.fn((event: string, fn: (arg?: unknown) => void) => {
    mockHandlers[event] = fn;
  }),
  onAny: jest.fn((fn: (event: string, payload: unknown) => void) => {
    mockHandlers.__any = (arg) => {
      const [event, payload] = arg as [string, unknown];
      fn(event, payload);
    };
  }),
  connect: jest.fn(),
  disconnect: jest.fn(),
  removeAllListeners: jest.fn(),
};
jest.mock('socket.io-client', () => ({ io: jest.fn(() => mockSocket) }));

import { RealtimeClient, useRealtimeStatus } from './realtime-client';

describe('RealtimeClient', () => {
  const deps = { url: 'http://x', getAccessToken: jest.fn(async () => 't'), refresh: jest.fn(async () => true) };

  it('tracks status and replays events to subscribers', async () => {
    const client = new RealtimeClient(deps);
    await client.connect();
    expect(useRealtimeStatus.getState().status).toBe('connecting');

    const reconnected = jest.fn();
    const messages = jest.fn();
    client.on('reconnected', reconnected);
    const off = client.on('message:new', messages);

    mockHandlers.connect();
    expect(useRealtimeStatus.getState().status).toBe('connected');
    expect(reconnected).toHaveBeenCalledTimes(1);

    mockHandlers.__any(['message:new', { id: 'm1' }]);
    expect(messages).toHaveBeenCalledWith({ id: 'm1' });
    off();
    mockHandlers.__any(['message:new', { id: 'm2' }]);
    expect(messages).toHaveBeenCalledTimes(1);

    mockHandlers.disconnect();
    expect(useRealtimeStatus.getState().status).toBe('offline');
  });

  it('refreshes the token and reconnects when the server rejects it', async () => {
    const client = new RealtimeClient(deps);
    await client.connect();
    mockHandlers.connect_error(new Error('UNAUTHORIZED'));
    await Promise.resolve();
    await Promise.resolve();
    expect(deps.refresh).toHaveBeenCalled();
    expect(mockSocket.connect).toHaveBeenCalled();
  });

  it('refuses requests while offline', async () => {
    const client = new RealtimeClient(deps);
    await client.connect();
    await expect(client.request('message:send', {})).rejects.toThrow('offline');
  });
});
