import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { DashboardState, TestFile, TestExecution, TestConfiguration, TestReport, TestStatistics, SystemHealth } from '../types';
import apiService from '../services/api';
import webSocketService from '../services/websocket';
import toast from 'react-hot-toast';

// Initial state
const initialState: DashboardState = {
  tests: [],
  executions: [],
  activeExecution: undefined,
  configuration: {},
  reports: [],
  statistics: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    lastRun: null
  },
  health: {
    status: 'healthy',
    issues: []
  },
  connected: false
};

// Action types
type DashboardAction =
  | { type: 'SET_TESTS'; payload: TestFile[] }
  | { type: 'SET_EXECUTIONS'; payload: TestExecution[] }
  | { type: 'ADD_EXECUTION'; payload: TestExecution }
  | { type: 'UPDATE_EXECUTION'; payload: TestExecution }
  | { type: 'SET_ACTIVE_EXECUTION'; payload: TestExecution | undefined }
  | { type: 'SET_CONFIGURATION'; payload: TestConfiguration }
  | { type: 'UPDATE_CONFIGURATION'; payload: Partial<TestConfiguration> }
  | { type: 'SET_REPORTS'; payload: TestReport[] }
  | { type: 'SET_STATISTICS'; payload: TestStatistics }
  | { type: 'SET_HEALTH'; payload: SystemHealth }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'APPEND_EXECUTION_OUTPUT'; payload: { executionId: string; output: string } }
  | { type: 'CLEAR_EXECUTIONS' }
  | { type: 'RESET_STATE' };

// Reducer
function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_TESTS':
      return { ...state, tests: action.payload };
    
    case 'SET_EXECUTIONS':
      return { ...state, executions: action.payload };
    
    case 'ADD_EXECUTION':
      return { 
        ...state, 
        executions: [action.payload, ...state.executions],
        activeExecution: action.payload.status === 'running' ? action.payload : state.activeExecution
      };
    
    case 'UPDATE_EXECUTION':
      const updatedExecutions = state.executions.map(exec => 
        exec.id === action.payload.id ? action.payload : exec
      );
      return { 
        ...state, 
        executions: updatedExecutions,
        activeExecution: state.activeExecution?.id === action.payload.id ? action.payload : state.activeExecution
      };
    
    case 'SET_ACTIVE_EXECUTION':
      return { ...state, activeExecution: action.payload };
    
    case 'SET_CONFIGURATION':
      return { ...state, configuration: action.payload };
    
    case 'UPDATE_CONFIGURATION':
      return { ...state, configuration: { ...state.configuration, ...action.payload } };
    
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    
    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };
    
    case 'SET_HEALTH':
      return { ...state, health: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, connected: action.payload };
    
    case 'APPEND_EXECUTION_OUTPUT':
      const { executionId, output } = action.payload;
      return {
        ...state,
        executions: state.executions.map(exec =>
          exec.id === executionId 
            ? { ...exec, output: [...exec.output, output] }
            : exec
        ),
        activeExecution: state.activeExecution?.id === executionId
          ? { ...state.activeExecution, output: [...state.activeExecution.output, output] }
          : state.activeExecution
      };
    
    case 'CLEAR_EXECUTIONS':
      return { ...state, executions: [], activeExecution: undefined };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface DashboardContextType {
  state: DashboardState;
  actions: {
    loadTests: () => Promise<void>;
    executeTest: (testFiles: string[], options?: any) => Promise<string>;
    executeAllTests: (options?: any) => Promise<string>;
    stopExecution: (executionId: string) => Promise<boolean>;
    loadExecutionHistory: () => Promise<void>;
    loadConfiguration: () => Promise<void>;
    updateConfiguration: (config: Partial<TestConfiguration>) => Promise<void>;
    loadReports: () => Promise<void>;
    loadStatistics: () => Promise<void>;
    generateReport: () => Promise<void>;
    clearReports: () => Promise<void>;
    checkHealth: () => Promise<void>;
    connectWebSocket: () => Promise<void>;
    disconnectWebSocket: () => void;
    clearExecutions: () => void;
    refreshAll: () => Promise<void>;
  };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Actions
  const actions = {
    loadTests: async () => {
      try {
        const tests = await apiService.getTests();
        dispatch({ type: 'SET_TESTS', payload: tests });
      } catch (error) {
        console.error('Failed to load tests:', error);
        toast.error('Failed to load tests');
      }
    },

    executeTest: async (testFiles: string[], options: any = {}) => {
      try {
        const executionId = await apiService.executeTest(testFiles, options);
        toast.success('Test execution started');
        return executionId;
      } catch (error) {
        console.error('Failed to execute test:', error);
        toast.error('Failed to execute test');
        throw error;
      }
    },

    executeAllTests: async (options: any = {}) => {
      try {
        const executionId = await apiService.executeAllTests(options);
        toast.success('All tests execution started');
        return executionId;
      } catch (error) {
        console.error('Failed to execute all tests:', error);
        toast.error('Failed to execute all tests');
        throw error;
      }
    },

    stopExecution: async (executionId: string) => {
      try {
        const stopped = await apiService.stopExecution(executionId);
        if (stopped) {
          toast.success('Test execution stopped');
        } else {
          toast.error('Failed to stop test execution');
        }
        return stopped;
      } catch (error) {
        console.error('Failed to stop execution:', error);
        toast.error('Failed to stop execution');
        return false;
      }
    },

    loadExecutionHistory: async () => {
      try {
        const executions = await apiService.getExecutionHistory();
        dispatch({ type: 'SET_EXECUTIONS', payload: executions });
      } catch (error) {
        console.error('Failed to load execution history:', error);
        toast.error('Failed to load execution history');
      }
    },

    loadConfiguration: async () => {
      try {
        const config = await apiService.getConfiguration();
        dispatch({ type: 'SET_CONFIGURATION', payload: config });
      } catch (error) {
        console.error('Failed to load configuration:', error);
        toast.error('Failed to load configuration');
      }
    },

    updateConfiguration: async (config: Partial<TestConfiguration>) => {
      try {
        const updatedConfig = await apiService.updateConfiguration(config);
        dispatch({ type: 'SET_CONFIGURATION', payload: updatedConfig });
        toast.success('Configuration updated');
      } catch (error) {
        console.error('Failed to update configuration:', error);
        toast.error('Failed to update configuration');
      }
    },

    loadReports: async () => {
      try {
        const reports = await apiService.getReports();
        dispatch({ type: 'SET_REPORTS', payload: reports });
      } catch (error) {
        console.error('Failed to load reports:', error);
        toast.error('Failed to load reports');
      }
    },

    loadStatistics: async () => {
      try {
        const stats = await apiService.getReportStats();
        dispatch({ type: 'SET_STATISTICS', payload: stats });
      } catch (error) {
        console.error('Failed to load statistics:', error);
        toast.error('Failed to load statistics');
      }
    },

    generateReport: async () => {
      try {
        await apiService.generateReport();
        toast.success('Report generation started');
        await actions.loadReports();
      } catch (error) {
        console.error('Failed to generate report:', error);
        toast.error('Failed to generate report');
      }
    },

    clearReports: async () => {
      try {
        await apiService.clearReports();
        toast.success('Reports cleared');
        await actions.loadReports();
        await actions.loadStatistics();
      } catch (error) {
        console.error('Failed to clear reports:', error);
        toast.error('Failed to clear reports');
      }
    },

    deleteReport: async (reportId: string) => {
      try {
        // Implementation would depend on your API
        // await apiService.deleteReport(reportId);
        toast.success('Report deleted');
        await actions.loadReports();
      } catch (error) {
        console.error('Failed to delete report:', error);
        toast.error('Failed to delete report');
      }
    },

    checkHealth: async () => {
      try {
        await apiService.getHealth();
        dispatch({ type: 'SET_HEALTH', payload: { status: 'healthy', issues: [] } });
      } catch (error) {
        console.error('Health check failed:', error);
        dispatch({ type: 'SET_HEALTH', payload: { status: 'error', issues: ['API server unavailable'] } });
      }
    },

    connectWebSocket: async () => {
      try {
        await webSocketService.connect();
        dispatch({ type: 'SET_CONNECTED', payload: true });
        toast.success('Connected to real-time updates');
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        dispatch({ type: 'SET_CONNECTED', payload: false });
        toast.error('Failed to connect to real-time updates');
      }
    },

    disconnectWebSocket: () => {
      webSocketService.disconnect();
      dispatch({ type: 'SET_CONNECTED', payload: false });
    },

    clearExecutions: () => {
      dispatch({ type: 'CLEAR_EXECUTIONS' });
    },

    refreshAll: async () => {
      await Promise.allSettled([
        actions.loadTests(),
        actions.loadConfiguration(),
        actions.loadReports(),
        actions.loadStatistics(),
        actions.loadExecutionHistory(),
        actions.checkHealth()
      ]);
    }
  };

  // WebSocket event handlers
  useEffect(() => {
    const setupWebSocketHandlers = () => {
      webSocketService.on('connection-established', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
      });

      webSocketService.on('test-started', (data) => {
        const execution: TestExecution = {
          id: data.executionId,
          testFile: data.testFile,
          status: 'running',
          startTime: new Date(data.startTime),
          output: []
        };
        dispatch({ type: 'ADD_EXECUTION', payload: execution });
      });

      webSocketService.on('test-output', (data) => {
        dispatch({ 
          type: 'APPEND_EXECUTION_OUTPUT', 
          payload: { executionId: data.executionId, output: data.output }
        });
      });

      webSocketService.on('test-completed', (data) => {
        const execution: TestExecution = {
          id: data.executionId,
          testFile: data.testFile,
          status: 'completed',
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          exitCode: data.exitCode,
          output: []
        };
        dispatch({ type: 'UPDATE_EXECUTION', payload: execution });
        toast.success(`Test completed: ${data.testFile}`);
      });

      webSocketService.on('test-failed', (data) => {
        const execution: TestExecution = {
          id: data.executionId,
          testFile: data.testFile,
          status: 'failed',
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          exitCode: data.exitCode,
          output: []
        };
        dispatch({ type: 'UPDATE_EXECUTION', payload: execution });
        toast.error(`Test failed: ${data.testFile}`);
      });

      webSocketService.on('test-cancelled', (data) => {
        const execution: TestExecution = {
          id: data.executionId,
          testFile: data.testFile,
          status: 'cancelled',
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          output: []
        };
        dispatch({ type: 'UPDATE_EXECUTION', payload: execution });
        toast(`Test cancelled: ${data.testFile}`);
      });

      webSocketService.on('health-status', (data) => {
        dispatch({ type: 'SET_HEALTH', payload: data });
      });

      webSocketService.on('system-notification', (data) => {
        switch (data.type) {
          case 'info':
            toast(data.message);
            break;
          case 'warning':
            toast(data.message, { icon: '⚠️' });
            break;
          case 'error':
            toast.error(data.message);
            break;
        }
      });

      webSocketService.on('connection-failed', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
        toast.error('Real-time connection lost');
      });
    };

    setupWebSocketHandlers();

    // Initial connection
    actions.connectWebSocket();

    // Cleanup
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  // Initial data load
  useEffect(() => {
    actions.refreshAll();
  }, []);

  return (
    <DashboardContext.Provider value={{ state, actions }}>
      {children}
    </DashboardContext.Provider>
  );
}

// Hook to use dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

export default DashboardContext;