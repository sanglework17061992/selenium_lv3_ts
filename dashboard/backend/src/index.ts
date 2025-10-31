import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import testRoutes from './routes/tests';
import configRoutes from './routes/config';
import reportRoutes from './routes/reports';

// Import services
import { TestExecutionService } from './services/TestExecutionService';
import { WebSocketService } from './services/WebSocketService';
import ServiceContainer from './ServiceContainer';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

class DashboardServer {
  private app: express.Application;
  private server: any;
  private io?: Server;
  private port: number;
  private testExecutionService: TestExecutionService;
  private webSocketService?: WebSocketService;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.API_PORT || '3000');
    
    // Initialize services first
    this.testExecutionService = new TestExecutionService();
    
    // Set service in container for routes to access
    ServiceContainer.getInstance().setTestExecutionService(this.testExecutionService);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupServer();
  }

  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3002',
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // Static files for reports
    this.app.use('/reports', express.static(path.join(__dirname, '../../../reports')));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/tests', testRoutes);
    this.app.use('/api/config', configRoutes);
    this.app.use('/api/reports', reportRoutes);

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
      });
    });
  }

  private setupServer(): void {
    this.server = createServer(this.app);
    
    // Setup Socket.IO
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL 
          : 'http://localhost:3002',
        methods: ['GET', 'POST']
      }
    });

    // Initialize WebSocket service with Socket.IO instance and test execution service
    this.webSocketService = new WebSocketService(this.io, this.testExecutionService);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`🚀 Dashboard Backend Server running on port ${this.port}`);
      console.log(`📊 Health check: http://localhost:${this.port}/health`);
      console.log(`📁 Reports available at: http://localhost:${this.port}/reports`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }

  public stop(): void {
    if (this.server) {
      this.server.close();
      console.log('Server stopped');
    }
  }
}

// Start server
const dashboardServer = new DashboardServer();
dashboardServer.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  dashboardServer.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  dashboardServer.stop();
  process.exit(0);
});

export default DashboardServer;