import { TestExecutionService } from './services/TestExecutionService';

class ServiceContainer {
  private static instance: ServiceContainer;
  private testExecutionService?: TestExecutionService;

  private constructor() {}

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  public setTestExecutionService(service: TestExecutionService): void {
    this.testExecutionService = service;
  }

  public getTestExecutionService(): TestExecutionService {
    if (!this.testExecutionService) {
      throw new Error('TestExecutionService not initialized');
    }
    return this.testExecutionService;
  }
}

export default ServiceContainer;