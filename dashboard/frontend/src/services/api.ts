import axios, { AxiosResponse } from 'axios';
import {
  TestFile,
  TestExecution,
  TestExecutionOptions,
  TestConfiguration,
  BrowserOption,
  PlatformOption,
  EnvironmentOption,
  TestReport,
  TestStatistics,
  SystemHealth,
  ApiResponse
} from '../types';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = BASE_URL;
    
    // Configure axios defaults
    axios.defaults.baseURL = this.baseURL;
    axios.defaults.timeout = 30000;
    axios.defaults.headers.common['Content-Type'] = 'application/json';
  }

  // Health check
  async getHealth(): Promise<{ status: string; timestamp: string; version: string }> {
    const response = await axios.get('/health');
    return response.data;
  }

  // Tests API
  async getTests(): Promise<TestFile[]> {
    const response = await axios.get('/api/tests');
    return response.data.tests || response.data;
  }

  async executeTest(testFiles: string[], options: TestExecutionOptions = {}): Promise<string> {
    const response = await axios.post('/api/tests/execute', {
      testFiles,
      config: options
    });
    return response.data.executionId;
  }

  async executeAllTests(options: TestExecutionOptions = {}): Promise<string> {
    const response = await axios.post('/api/tests/execute', {
      testFiles: ['**/*.test.ts'],
      config: options
    });
    return response.data.executionId;
  }

  async stopExecution(executionId: string): Promise<boolean> {
    const response = await axios.post(`/api/tests/stop/${executionId}`);
    return response.data.cancelled || false;
  }

  async getExecutionStatus(executionId: string): Promise<TestExecution | null> {
    try {
      const response = await axios.get(`/api/tests/status/${executionId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getExecutionHistory(): Promise<TestExecution[]> {
    const response = await axios.get('/api/tests/history');
    return response.data.history || response.data.executions || [];
  }

  // Configuration API
  async getConfiguration(): Promise<TestConfiguration> {
    const response = await axios.get('/api/config');
    return response.data.config || response.data;
  }

  async updateConfiguration(config: Partial<TestConfiguration>): Promise<TestConfiguration> {
    const response = await axios.put('/api/config', { config });
    return response.data.config || response.data;
  }

  async getBrowserOptions(): Promise<BrowserOption[]> {
    const response = await axios.get('/api/config/browsers');
    return response.data.browsers || [];
  }

  async getPlatformOptions(): Promise<PlatformOption[]> {
    const response = await axios.get('/api/config/platforms');
    return response.data.platforms || [];
  }

  async getEnvironmentOptions(): Promise<EnvironmentOption[]> {
    const response = await axios.get('/api/config/environments');
    return response.data.environments || [];
  }

  async validateConfiguration(config: TestConfiguration): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await axios.post('/api/config/validate', { config });
    return response.data;
  }

  // Reports API
  async getReports(): Promise<TestReport[]> {
    const response = await axios.get('/api/reports');
    return response.data.reports || [];
  }

  async generateReport(): Promise<{ message: string; status: string; outputPath: string }> {
    const response = await axios.post('/api/reports/generate');
    return response.data;
  }

  async clearReports(): Promise<{ message: string }> {
    const response = await axios.delete('/api/reports');
    return response.data;
  }

  async getReportStats(): Promise<TestStatistics> {
    const response = await axios.get('/api/reports/stats');
    return response.data;
  }

  async downloadReportFile(filename: string): Promise<Blob> {
    const response = await axios.get(`/api/reports/download/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  // Utility methods
  async checkServerConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  }

  getApiUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  // Error handling wrapper
  async safeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<ApiResponse<T>> {
    try {
      const response = await requestFn();
      return { data: response.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'An unexpected error occurred';
      
      return { error: errorMessage };
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;