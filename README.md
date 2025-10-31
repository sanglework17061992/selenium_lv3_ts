# 🚀 Selenium TypeScript Automation Framework

A comprehensive Selenium automation framework built with TypeScript, featuring a web-based dashboard for test management and execution.

## 🌟 Features

### Framework Core
- **Clean Architecture**: Implements Page Object Model, Factory, and Singleton design patterns
- **Cross-Browser Support**: Chrome, Firefox, Edge, Safari
- **Smart Waiting**: Auto-wait mechanisms and retry strategies to reduce flaky tests
- **Custom Assertions**: Robust assertion layer with built-in retry mechanisms
- **Parallel Execution**: Run tests in parallel for faster feedback
- **Environment Configuration**: Easy environment management via .env files

### Dashboard (Coming Soon)
- **Web-Based Control**: Manage tests without writing code
- **Real-Time Monitoring**: Live test execution with progress tracking
- **Configuration Management**: Update settings through intuitive UI
- **Reporting Dashboard**: Comprehensive test results and analytics
- **CI/CD Integration**: Generate pipeline configurations

### Reporting
- **Allure Reports**: Beautiful and detailed test reports
- **Screenshots**: Automatic screenshot capture on failures
- **Logging**: Comprehensive logging with Winston
- **Test Metrics**: Detailed performance and execution metrics

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/sanglework17061992/selenium_lv3_ts.git
cd selenium_lv3_ts

# Install dependencies
npm install

# Run tests
npm test

# Run tests with specific browser
npm run test:chrome
npm run test:firefox

# Generate Allure report
npm run test:report
```

## 📁 Project Structure

```
selenium_lv3_ts/
├── src/
│   ├── core/           # Framework core classes
│   ├── config/         # Configuration management
│   ├── pages/          # Page Object Models
│   ├── utils/          # Utility classes
│   └── types/          # TypeScript definitions
├── tests/              # Test files
├── dashboard/          # Web dashboard (coming soon)
├── reports/            # Test reports
└── .env               # Environment configuration
```

## 🔧 Configuration

Edit `.env` file to configure your test environment:

```env
# Browser Configuration
BROWSER=chrome
HEADLESS=false
BASE_URL=https://the-internet.herokuapp.com

# Test Configuration
RETRY_COUNT=3
PARALLEL_MODE=true
MAX_WORKERS=4

# Reporting
ENABLE_SCREENSHOTS=true
ENABLE_LOGGING=true
```

## 📖 Documentation

Detailed documentation will be available in the `docs` folder once the implementation branch is merged.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🏗️ Development Status

This framework is currently under active development. The implementation is being done in the `implementation` branch.

### Completed Features
- ✅ Project structure and configuration
- ✅ Core framework classes
- ✅ Page Object Model implementation
- ✅ Custom assertion layer
- ✅ Allure reporting integration

### In Progress
- 🔄 Web dashboard development
- 🔄 CI/CD templates
- 🔄 Comprehensive documentation

### Planned Features
- 📋 API testing integration
- 📋 Mobile testing support (Appium)
- 📋 Visual regression testing
- 📋 Performance testing integration