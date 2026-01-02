import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

class SocketClient {
  private sockets: Map<string, Socket> = new Map();

  connect(namespace: string, token: string): Socket {
    if (this.sockets.has(namespace)) {
      return this.sockets.get(namespace)!;
    }

    const socket = io(`${SOCKET_URL}${namespace}`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.sockets.set(namespace, socket);
    return socket;
  }

  disconnect(namespace: string): void {
    const socket = this.sockets.get(namespace);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(namespace);
    }
  }

  disconnectAll(): void {
    this.sockets.forEach((socket) => socket.disconnect());
    this.sockets.clear();
  }

  getSocket(namespace: string): Socket | undefined {
    return this.sockets.get(namespace);
  }
}

export const socketClient = new SocketClient();

export const NAMESPACES = {
  EMERGENCY: '/emergency',
  VEHICLE: '/vehicle',
  TRAFFIC: '/traffic',
  SIGNAL: '/signal',
  CHAT: '/chat',
  ANALYTICS: '/analytics',
} as const;
