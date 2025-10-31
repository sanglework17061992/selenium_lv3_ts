// Type definitions for the framework
export interface BrowserConfig {
  browserName: string;
  headless: boolean;
  windowSize: string;
  platform: string;
}

export interface TestConfig {
  baseUrl: string;
  environment: string;
  retryCount: number;
  timeout: number;
  implicitWait: number;
  explicitWait: number;
  parallelMode: boolean;
  maxWorkers: number;
}

export interface ReportingConfig {
  enableScreenshots: boolean;
  enableVideo: boolean;
  enableLogging: boolean;
  logLevel: string;
}

export interface FrameworkConfig {
  browser: BrowserConfig;
  test: TestConfig;
  reporting: ReportingConfig;
}

export interface ElementAction {
  element: string;
  action: string;
  value?: string;
  timeout?: number;
}

export interface AssertionOptions {
  timeout?: number;
  retryInterval?: number;
  message?: string;
}

export type BrowserType = 'chrome' | 'firefox' | 'edge' | 'safari';
export type PlatformType = 'windows' | 'macos' | 'linux';
export type EnvironmentType = 'dev' | 'staging' | 'prod';