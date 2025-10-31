export interface TestFile {
  id: string;
  name: string;
  filename: string;
  path: string;
  enabled: boolean;
  description?: string;
  tags?: string[];
  estimatedDuration?: number;
}

export interface TestExecution {
  id: string;
  testFile: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  output: string[];
  exitCode?: number;
  duration?: number;
}

export interface TestExecutionOptions {
  testPattern?: string;
  browser?: string;
  headless?: boolean;
  environment?: string;
  parallel?: boolean;
  maxWorkers?: number;
}

export interface TestConfiguration {
  NODE_ENV?: string;
  BROWSER?: string;
  HEADLESS?: string;
  WINDOW_SIZE?: string;
  PLATFORM?: string;
  BASE_URL?: string;
  ENVIRONMENT?: string;
  RETRY_COUNT?: string;
  TIMEOUT?: string;
  IMPLICIT_WAIT?: string;
  EXPLICIT_WAIT?: string;
  PARALLEL_MODE?: string;
  MAX_WORKERS?: string;
  ENABLE_SCREENSHOTS?: string;
  ENABLE_VIDEO?: string;
  ENABLE_LOGGING?: string;
  LOG_LEVEL?: string;
  DASHBOARD_PORT?: string;
  API_PORT?: string;
  EMAIL_NOTIFICATIONS?: string;
  CI_MODE?: string;
}

export interface BrowserOption {
  value: string;
  label: string;
  icon: string;
}

export interface PlatformOption {
  value: string;
  label: string;
  icon: string;
}

export interface EnvironmentOption {
  value: string;
  label: string;
  icon: string;
}

export interface TestReport {
  id: string;
  name?: string;
  executionId?: string;
  type: 'results' | 'report';
  path: string;
  files?: string[];
  count?: number;
  exists?: boolean;
  url?: string;
  allureReportUrl?: string;
  status?: 'passed' | 'failed' | 'skipped' | 'unknown';
  totalTests?: number;
  passedTests?: number;
  failedTests?: number;
  skippedTests?: number;
  duration?: number;
  createdAt?: string;
}

export interface TestStatistics {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  lastRun: string | null;
}

export interface SystemHealth {
  status: 'healthy' | 'issues' | 'error';
  issues: string[];
}

export interface ExecutionEvent {
  type: 'started' | 'output' | 'completed' | 'failed' | 'cancelled';
  executionId: string;
  data: any;
  timestamp: string;
}

export interface DashboardState {
  tests: TestFile[];
  executions: TestExecution[];
  activeExecution?: TestExecution;
  configuration: TestConfiguration;
  reports: TestReport[];
  statistics: TestStatistics;
  health: SystemHealth;
  connected: boolean;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}