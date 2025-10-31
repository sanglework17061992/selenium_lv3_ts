import express from 'express';
import fs from 'fs-extra';
import path from 'path';

const router = express.Router();

// Get Allure reports
router.get('/', async (req, res) => {
  try {
    const allureResultsPath = path.join(__dirname, '../../../../allure-results');
    const allureReportPath = path.join(__dirname, '../../../../allure-report');
    
    const reports = [];
    
    // Check if allure-results exists
    if (await fs.pathExists(allureResultsPath)) {
      const files = await fs.readdir(allureResultsPath);
      const resultFiles = files.filter(file => file.endsWith('.json'));
      
      reports.push({
        type: 'results',
        path: allureResultsPath,
        files: resultFiles,
        count: resultFiles.length
      });
    }
    
    // Check if allure-report exists
    if (await fs.pathExists(allureReportPath)) {
      const reportExists = await fs.pathExists(path.join(allureReportPath, 'index.html'));
      
      reports.push({
        type: 'report',
        path: allureReportPath,
        exists: reportExists,
        url: reportExists ? '/reports/allure' : null
      });
    }
    
    res.json({ reports });
  } catch (error) {
    console.error('Error reading reports:', error);
    res.status(500).json({ error: 'Failed to read reports' });
  }
});

// Generate Allure report
router.post('/generate', async (req, res) => {
  try {
    const allureResultsPath = path.join(__dirname, '../../../../allure-results');
    const allureReportPath = path.join(__dirname, '../../../../allure-report');
    
    // Check if results exist
    if (!await fs.pathExists(allureResultsPath)) {
      return res.status(404).json({ error: 'No test results found to generate report' });
    }
    
    // Ensure report directory exists
    await fs.ensureDir(allureReportPath);
    
    // In a real implementation, you would call allure command line here
    // For now, we'll simulate the process
    res.json({ 
      message: 'Report generation started',
      status: 'processing',
      outputPath: allureReportPath
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Clear reports
router.delete('/', async (req, res) => {
  try {
    const allureResultsPath = path.join(__dirname, '../../../../allure-results');
    const allureReportPath = path.join(__dirname, '../../../../allure-report');
    
    // Clear results
    if (await fs.pathExists(allureResultsPath)) {
      await fs.emptyDir(allureResultsPath);
    }
    
    // Clear report
    if (await fs.pathExists(allureReportPath)) {
      await fs.emptyDir(allureReportPath);
    }
    
    res.json({ message: 'Reports cleared successfully' });
  } catch (error) {
    console.error('Error clearing reports:', error);
    res.status(500).json({ error: 'Failed to clear reports' });
  }
});

// Get specific report file
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const allureResultsPath = path.join(__dirname, '../../../../allure-results');
    const filePath = path.join(allureResultsPath, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Report file not found' });
    }
    
    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileContent = await fs.readFile(filePath);
    res.send(fileContent);
  } catch (error) {
    console.error('Error downloading report file:', error);
    res.status(500).json({ error: 'Failed to download report file' });
  }
});

// Get test statistics from reports
router.get('/stats', async (req, res) => {
  try {
    const allureResultsPath = path.join(__dirname, '../../../../allure-results');
    
    if (!await fs.pathExists(allureResultsPath)) {
      return res.json({
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        lastRun: null
      });
    }
    
    const files = await fs.readdir(allureResultsPath);
    const resultFiles = files.filter(file => file.endsWith('-result.json'));
    
    let stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      lastRun: null as string | null
    };
    
    let latestTime = 0;
    
    for (const file of resultFiles) {
      try {
        const filePath = path.join(allureResultsPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const result = JSON.parse(content);
        
        stats.total++;
        
        switch (result.status) {
          case 'passed':
            stats.passed++;
            break;
          case 'failed':
            stats.failed++;
            break;
          case 'skipped':
            stats.skipped++;
            break;
        }
        
        if (result.stop && result.stop > latestTime) {
          latestTime = result.stop;
          stats.lastRun = new Date(latestTime).toISOString();
        }
      } catch (parseError) {
        console.warn(`Failed to parse result file ${file}:`, parseError);
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error reading report stats:', error);
    res.status(500).json({ error: 'Failed to read report statistics' });
  }
});

export default router;