import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { EventEmitter } from 'events';

interface TestExecution {
  id: string;
  testFile: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  output: string[];
  process?: ChildProcess;
  exitCode?: number;
}

interface TestExecutionOptions {
  testPattern?: string;
  browser?: string;
  headless?: boolean;
  environment?: string;
  parallel?: boolean;
  maxWorkers?: number;
}

export class TestExecutionService extends EventEmitter {
  private executions: Map<string, TestExecution> = new Map();
  private projectRoot: string;

  constructor() {
    super();
    this.projectRoot = path.join(__dirname, '../../../..');
  }

  async executeTest(testFile: string, options: TestExecutionOptions = {}): Promise<string> {
    const executionId = this.generateExecutionId();
    
    const execution: TestExecution = {
      id: executionId,
      testFile,
      status: 'running',
      startTime: new Date(),
      output: []
    };

    this.executions.set(executionId, execution);
    this.emit('executionStarted', execution);

    try {
      await this.runJestTest(execution, options);
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      this.emit('executionFailed', execution, error);
    }

    return executionId;
  }

  async executeAllTests(options: TestExecutionOptions = {}): Promise<string> {
    return this.executeTest('**/*.test.ts', options);
  }

  async executeTestSuite(suiteName: string, options: TestExecutionOptions = {}): Promise<string> {
    const testPattern = `**/${suiteName}*.test.ts`;
    return this.executeTest(testPattern, options);
  }

  private async runJestTest(execution: TestExecution, options: TestExecutionOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const args = this.buildJestArgs(execution.testFile, options);
      
      console.log(`Executing: npm test -- ${args.join(' ')}`);
      
      const childProcess = spawn('npm', ['test', '--', ...args], {
        cwd: this.projectRoot,
        env: {
          ...process.env,
          ...this.buildEnvironment(options)
        }
      });

      execution.process = childProcess;

      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        execution.output.push(output);
        this.emit('executionOutput', execution.id, output);
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        execution.output.push(output);
        this.emit('executionOutput', execution.id, output);
      });

      childProcess.on('close', (code: number | null) => {
        execution.exitCode = code || 0;
        execution.endTime = new Date();
        
        if (code === 0) {
          execution.status = 'completed';
          this.emit('executionCompleted', execution);
          resolve();
        } else {
          execution.status = 'failed';
          this.emit('executionFailed', execution, new Error(`Process exited with code ${code}`));
          reject(new Error(`Test execution failed with code ${code}`));
        }
      });

      childProcess.on('error', (error: Error) => {
        execution.status = 'failed';
        execution.endTime = new Date();
        this.emit('executionFailed', execution, error);
        reject(error);
      });
    });
  }

  private buildJestArgs(testFile: string, options: TestExecutionOptions): string[] {
    const args: string[] = [];

    // Test pattern
    if (testFile !== '**/*.test.ts') {
      args.push(testFile);
    }

    // Verbose output
    args.push('--verbose');

    // Parallel execution
    if (options.parallel && options.maxWorkers) {
      args.push(`--maxWorkers=${options.maxWorkers}`);
    } else if (!options.parallel) {
      args.push('--runInBand');
    }

    // Force exit to prevent hanging
    args.push('--forceExit');

    // Detect open handles
    args.push('--detectOpenHandles');

    return args;
  }

  private buildEnvironment(options: TestExecutionOptions): Record<string, string> {
    const env: Record<string, string> = {};

    if (options.browser) {
      env.BROWSER = options.browser;
    }

    if (options.headless !== undefined) {
      env.HEADLESS = options.headless.toString();
    }

    if (options.environment) {
      env.ENVIRONMENT = options.environment;
    }

    return env;
  }

  cancelExecution(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    
    if (!execution || execution.status !== 'running') {
      return false;
    }

    if (execution.process) {
      execution.process.kill('SIGTERM');
      execution.status = 'cancelled';
      execution.endTime = new Date();
      this.emit('executionCancelled', execution);
      return true;
    }

    return false;
  }

  getExecution(executionId: string): TestExecution | undefined {
    return this.executions.get(executionId);
  }

  getActiveExecutions(): TestExecution[] {
    return Array.from(this.executions.values()).filter(
      execution => execution.status === 'running'
    );
  }

  getExecutionHistory(limit: number = 50): TestExecution[] {
    return Array.from(this.executions.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  getExecutionOutput(executionId: string): string[] {
    const execution = this.executions.get(executionId);
    return execution?.output || [];
  }

  async clearHistory(): Promise<void> {
    // Keep only running executions
    const runningExecutions = new Map();
    
    for (const [id, execution] of this.executions) {
      if (execution.status === 'running') {
        runningExecutions.set(id, execution);
      }
    }
    
    this.executions = runningExecutions;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get test files available for execution
  async getAvailableTests(): Promise<string[]> {
    const testsDir = path.join(this.projectRoot, 'tests');
    
    if (!await fs.pathExists(testsDir)) {
      return [];
    }

    const files = await this.getAllTestFiles(testsDir);
    return files.map(file => path.relative(this.projectRoot, file));
  }

  private async getAllTestFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await this.getAllTestFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Health check for test environment
  async healthCheck(): Promise<{ status: string; issues: string[] }> {
    const issues: string[] = [];

    // Check if Node.js modules are installed
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    if (!await fs.pathExists(nodeModulesPath)) {
      issues.push('Node modules not installed');
    }

    // Check if Jest is available
    const jestConfigPath = path.join(this.projectRoot, 'jest.config.js');
    if (!await fs.pathExists(jestConfigPath)) {
      issues.push('Jest configuration not found');
    }

    // Check if TypeScript config exists
    const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (!await fs.pathExists(tsConfigPath)) {
      issues.push('TypeScript configuration not found');
    }

    // Check if test directory exists
    const testsDir = path.join(this.projectRoot, 'tests');
    if (!await fs.pathExists(testsDir)) {
      issues.push('Tests directory not found');
    }

    const status = issues.length === 0 ? 'healthy' : 'issues';
    
    return { status, issues };
  }
}

export default TestExecutionService;