import { Server as SocketIOServer, Socket } from 'socket.io';
import TestExecutionService from './TestExecutionService';

export interface ClientInfo {
  id: string;
  connectedAt: Date;
  userAgent?: string;
  ip?: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private clients: Map<string, ClientInfo> = new Map();
  private testExecutionService: TestExecutionService;

  constructor(io: SocketIOServer, testExecutionService: TestExecutionService) {
    this.io = io;
    this.testExecutionService = testExecutionService;
    this.setupEventHandlers();
    this.setupTestExecutionEvents();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Store client info
      const clientInfo: ClientInfo = {
        id: socket.id,
        connectedAt: new Date(),
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address
      };
      this.clients.set(socket.id, clientInfo);

      // Send initial connection acknowledgment
      socket.emit('connected', {
        clientId: socket.id,
        serverTime: new Date().toISOString(),
        message: 'Successfully connected to test dashboard'
      });

      // Handle test execution requests
      socket.on('execute-test', async (data) => {
        try {
          const { testFile, options = {} } = data;
          console.log(`Executing test: ${testFile}`, options);
          
          const executionId = await this.testExecutionService.executeTest(testFile, options);
          
          socket.emit('test-execution-started', {
            executionId,
            testFile,
            startTime: new Date().toISOString()
          });
        } catch (error) {
          socket.emit('test-execution-error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            testFile: data.testFile
          });
        }
      });

      // Handle test execution cancellation
      socket.on('cancel-execution', (data) => {
        const { executionId } = data;
        const cancelled = this.testExecutionService.cancelExecution(executionId);
        
        socket.emit('execution-cancellation-result', {
          executionId,
          cancelled,
          message: cancelled ? 'Execution cancelled successfully' : 'Failed to cancel execution'
        });
      });

      // Handle request for execution status
      socket.on('get-execution-status', (data) => {
        const { executionId } = data;
        const execution = this.testExecutionService.getExecution(executionId);
        
        socket.emit('execution-status', {
          executionId,
          execution: execution ? {
            id: execution.id,
            testFile: execution.testFile,
            status: execution.status,
            startTime: execution.startTime,
            endTime: execution.endTime,
            exitCode: execution.exitCode
          } : null
        });
      });

      // Handle request for execution output
      socket.on('get-execution-output', (data) => {
        const { executionId } = data;
        const output = this.testExecutionService.getExecutionOutput(executionId);
        
        socket.emit('execution-output', {
          executionId,
          output
        });
      });

      // Handle request for active executions
      socket.on('get-active-executions', () => {
        const activeExecutions = this.testExecutionService.getActiveExecutions();
        
        socket.emit('active-executions', {
          executions: activeExecutions.map(exec => ({
            id: exec.id,
            testFile: exec.testFile,
            status: exec.status,
            startTime: exec.startTime
          }))
        });
      });

      // Handle request for execution history
      socket.on('get-execution-history', (data) => {
        const { limit = 20 } = data;
        const history = this.testExecutionService.getExecutionHistory(limit);
        
        socket.emit('execution-history', {
          executions: history.map(exec => ({
            id: exec.id,
            testFile: exec.testFile,
            status: exec.status,
            startTime: exec.startTime,
            endTime: exec.endTime,
            exitCode: exec.exitCode
          }))
        });
      });

      // Handle health check request
      socket.on('health-check', async () => {
        try {
          const health = await this.testExecutionService.healthCheck();
          socket.emit('health-status', health);
        } catch (error) {
          socket.emit('health-status', {
            status: 'error',
            issues: [error instanceof Error ? error.message : 'Health check failed']
          });
        }
      });

      // Handle client ping
      socket.on('ping', () => {
        socket.emit('pong', {
          timestamp: new Date().toISOString()
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        this.clients.delete(socket.id);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for client ${socket.id}:`, error);
      });
    });
  }

  private setupTestExecutionEvents(): void {
    // Listen to test execution service events and broadcast to clients
    this.testExecutionService.on('executionStarted', (execution) => {
      this.broadcast('test-started', {
        executionId: execution.id,
        testFile: execution.testFile,
        startTime: execution.startTime
      });
    });

    this.testExecutionService.on('executionOutput', (executionId, output) => {
      this.broadcast('test-output', {
        executionId,
        output,
        timestamp: new Date().toISOString()
      });
    });

    this.testExecutionService.on('executionCompleted', (execution) => {
      this.broadcast('test-completed', {
        executionId: execution.id,
        testFile: execution.testFile,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        exitCode: execution.exitCode
      });
    });

    this.testExecutionService.on('executionFailed', (execution, error) => {
      this.broadcast('test-failed', {
        executionId: execution.id,
        testFile: execution.testFile,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime,
        exitCode: execution.exitCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    });

    this.testExecutionService.on('executionCancelled', (execution) => {
      this.broadcast('test-cancelled', {
        executionId: execution.id,
        testFile: execution.testFile,
        status: execution.status,
        startTime: execution.startTime,
        endTime: execution.endTime
      });
    });
  }

  // Broadcast message to all connected clients
  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // Send message to specific client
  public sendToClient(clientId: string, event: string, data: any): void {
    this.io.to(clientId).emit(event, data);
  }

  // Get connected clients info
  public getConnectedClients(): ClientInfo[] {
    return Array.from(this.clients.values());
  }

  // Get client count
  public getClientCount(): number {
    return this.clients.size;
  }

  // Send system notification to all clients
  public sendSystemNotification(message: string, type: 'info' | 'warning' | 'error' = 'info'): void {
    this.broadcast('system-notification', {
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  // Close all connections and cleanup
  public close(): void {
    this.io.close();
    this.clients.clear();
  }
}

export default WebSocketService;