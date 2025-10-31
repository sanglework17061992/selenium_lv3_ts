import { io, Socket } from 'socket.io-client';
import { ExecutionEvent, TestExecution, SystemHealth } from '../types';

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private baseURL: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private eventListeners: Map<string, EventCallback[]> = new Map();

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.baseURL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          this.handleReconnect();
        }
      });
    });
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connected', (data) => {
      console.log('📡 Server acknowledged connection:', data);
      this.emit('connection-established', data);
    });

    // Test execution events
    this.socket.on('test-started', (data) => {
      this.emit('test-started', data);
    });

    this.socket.on('test-output', (data) => {
      this.emit('test-output', data);
    });

    this.socket.on('test-completed', (data) => {
      this.emit('test-completed', data);
    });

    this.socket.on('test-failed', (data) => {
      this.emit('test-failed', data);
    });

    this.socket.on('test-cancelled', (data) => {
      this.emit('test-cancelled', data);
    });

    // Execution events
    this.socket.on('test-execution-started', (data) => {
      this.emit('execution-started', data);
    });

    this.socket.on('test-execution-error', (data) => {
      this.emit('execution-error', data);
    });

    this.socket.on('execution-cancellation-result', (data) => {
      this.emit('execution-cancelled', data);
    });

    this.socket.on('execution-status', (data) => {
      this.emit('execution-status', data);
    });

    this.socket.on('execution-output', (data) => {
      this.emit('execution-output', data);
    });

    this.socket.on('active-executions', (data) => {
      this.emit('active-executions', data);
    });

    this.socket.on('execution-history', (data) => {
      this.emit('execution-history', data);
    });

    // Health events
    this.socket.on('health-status', (data) => {
      this.emit('health-status', data);
    });

    // System events
    this.socket.on('system-notification', (data) => {
      this.emit('system-notification', data);
    });

    this.socket.on('pong', (data) => {
      this.emit('pong', data);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.emit('connection-failed', { reason: 'Max reconnection attempts reached' });
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection attempt failed:', error);
      });
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  // Event emitter methods
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: EventCallback): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const callbacks = this.eventListeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for ${event}:`, error);
      }
    });
  }

  // API methods
  executeTest(testFile: string, options: any = {}): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('execute-test', { testFile, options });
  }

  cancelExecution(executionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('cancel-execution', { executionId });
  }

  getExecutionStatus(executionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('get-execution-status', { executionId });
  }

  getExecutionOutput(executionId: string): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('get-execution-output', { executionId });
  }

  getActiveExecutions(): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('get-active-executions');
  }

  getExecutionHistory(limit: number = 20): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('get-execution-history', { limit });
  }

  requestHealthCheck(): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('health-check');
  }

  ping(): void {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('ping');
  }

  // Status getters
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'disconnected';
  }
}

// Create and export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;