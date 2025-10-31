import express from 'express';
import ServiceContainer from '../ServiceContainer';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// Get all available test files
router.get('/', async (req, res) => {
  try {
    const testsPath = path.join(__dirname, '../../../../tests');
    const testFiles = await fs.readdir(testsPath);
    
    const tests = testFiles
      .filter(file => file.endsWith('.test.ts'))
      .map(file => ({
        id: file.replace('.test.ts', ''),
        name: file.replace('.test.ts', '').replace(/([A-Z])/g, ' $1').trim(),
        filename: file,
        path: path.join(testsPath, file),
        enabled: true
      }));

    res.json({ tests });
  } catch (error) {
    console.error('Error reading test files:', error);
    res.status(500).json({ error: 'Failed to read test files' });
  }
});

// Get test details
router.get('/:testId', async (req, res) => {
  try {
    const { testId } = req.params;
    const testPath = path.join(__dirname, '../../../../tests', `${testId}.test.ts`);
    
    if (!await fs.pathExists(testPath)) {
      return res.status(404).json({ error: 'Test file not found' });
    }

    const content = await fs.readFile(testPath, 'utf8');
    
    // Extract test descriptions (basic parsing)
    const testMatches = content.match(/test\([\s\S]*?\)/g) || [];
    const tests = testMatches.map((match, index) => {
      const nameMatch = match.match(/test\(\s*['"`](.*?)['"`]/);
      return {
        id: `${testId}-${index}`,
        name: nameMatch ? nameMatch[1] : `Test ${index + 1}`,
        enabled: true
      };
    });

    res.json({
      id: testId,
      name: testId.replace(/([A-Z])/g, ' $1').trim(),
      filename: `${testId}.test.ts`,
      path: testPath,
      tests,
      content: content.substring(0, 1000) + (content.length > 1000 ? '...' : '')
    });
  } catch (error) {
    console.error('Error reading test details:', error);
    res.status(500).json({ error: 'Failed to read test details' });
  }
});

// Execute tests
router.post('/execute', async (req, res) => {
  try {
    const { testFiles, config } = req.body;
    
    if (!testFiles || !Array.isArray(testFiles)) {
      return res.status(400).json({ error: 'Test files are required' });
    }

    // Get test execution service instance
    const executionService = ServiceContainer.getInstance().getTestExecutionService();
    
    // Start test execution
    const executionId = await executionService.executeAllTests(config);
    
    res.json({ 
      executionId,
      status: 'started',
      message: 'Test execution started'
    });
  } catch (error) {
    console.error('Error executing tests:', error);
    res.status(500).json({ error: 'Failed to execute tests' });
  }
});

// Stop test execution
router.post('/stop/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const executionService = ServiceContainer.getInstance().getTestExecutionService();
    const cancelled = executionService.cancelExecution(executionId);
    
    res.json({ 
      message: cancelled ? 'Test execution stopped' : 'Failed to stop execution',
      executionId,
      cancelled
    });
  } catch (error) {
    console.error('Error stopping tests:', error);
    res.status(500).json({ error: 'Failed to stop tests' });
  }
});

// Get execution status
router.get('/execution/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    
    const executionService = ServiceContainer.getInstance().getTestExecutionService();
    const execution = executionService.getExecution(executionId);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }
    
    res.json(execution);
  } catch (error) {
    console.error('Error getting execution status:', error);
    res.status(500).json({ error: 'Failed to get execution status' });
  }
});

// Get execution history
router.get('/history', async (req, res) => {
  try {
    const executionService = ServiceContainer.getInstance().getTestExecutionService();
    const history = executionService.getExecutionHistory();
    
    res.json({ history });
  } catch (error) {
    console.error('Error getting execution history:', error);
    res.status(500).json({ error: 'Failed to get execution history' });
  }
});

export default router;