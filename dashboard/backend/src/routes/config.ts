import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';

const router = express.Router();

// Get current configuration
router.get('/', async (req, res) => {
  try {
    const envPath = path.join(__dirname, '../../../../.env');
    
    if (!await fs.pathExists(envPath)) {
      return res.status(404).json({ error: 'Configuration file not found' });
    }

    const envContent = await fs.readFile(envPath, 'utf8');
    const config = dotenv.parse(envContent);
    
    // Remove sensitive data
    const safeConfig = { ...config };
    delete safeConfig.GITHUB_TOKEN;
    delete safeConfig.SLACK_WEBHOOK_URL;
    
    res.json({ config: safeConfig });
  } catch (error) {
    console.error('Error reading configuration:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// Update configuration
router.put('/', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid configuration data' });
    }

    const envPath = path.join(__dirname, '../../../../.env');
    
    // Read current config
    let currentConfig = {};
    if (await fs.pathExists(envPath)) {
      const envContent = await fs.readFile(envPath, 'utf8');
      currentConfig = dotenv.parse(envContent);
    }

    // Merge with new config
    const updatedConfig = { ...currentConfig, ...config };
    
    // Convert to .env format
    const envContent = Object.entries(updatedConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Write to file
    await fs.writeFile(envPath, envContent);
    
    res.json({ 
      message: 'Configuration updated successfully',
      config: updatedConfig 
    });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Get browser options
router.get('/browsers', (req, res) => {
  res.json({
    browsers: [
      { value: 'chrome', label: 'Chrome', icon: '🌐' },
      { value: 'firefox', label: 'Firefox', icon: '🦊' },
      { value: 'edge', label: 'Microsoft Edge', icon: '🌊' },
      { value: 'safari', label: 'Safari', icon: '🧭' }
    ]
  });
});

// Get platform options
router.get('/platforms', (req, res) => {
  res.json({
    platforms: [
      { value: 'linux', label: 'Linux', icon: '🐧' },
      { value: 'windows', label: 'Windows', icon: '🪟' },
      { value: 'macos', label: 'macOS', icon: '🍎' }
    ]
  });
});

// Get environment options
router.get('/environments', (req, res) => {
  res.json({
    environments: [
      { value: 'dev', label: 'Development', icon: '🛠️' },
      { value: 'staging', label: 'Staging', icon: '🎭' },
      { value: 'prod', label: 'Production', icon: '🚀' }
    ]
  });
});

// Validate configuration
router.post('/validate', async (req, res) => {
  try {
    const { config } = req.body;
    
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.BASE_URL) {
      errors.push('BASE_URL is required');
    } else if (!config.BASE_URL.startsWith('http')) {
      warnings.push('BASE_URL should start with http:// or https://');
    }

    // Validate browser
    const validBrowsers = ['chrome', 'firefox', 'edge', 'safari'];
    if (config.BROWSER && !validBrowsers.includes(config.BROWSER)) {
      warnings.push(`Browser "${config.BROWSER}" may not be supported`);
    }

    // Validate timeout values
    if (config.TIMEOUT && isNaN(parseInt(config.TIMEOUT))) {
      errors.push('TIMEOUT must be a number');
    }

    if (config.RETRY_COUNT && isNaN(parseInt(config.RETRY_COUNT))) {
      errors.push('RETRY_COUNT must be a number');
    }

    const isValid = errors.length === 0;
    
    res.json({
      valid: isValid,
      errors,
      warnings
    });
  } catch (error) {
    console.error('Error validating configuration:', error);
    res.status(500).json({ error: 'Failed to validate configuration' });
  }
});

export default router;