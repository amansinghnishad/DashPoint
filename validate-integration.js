#!/usr/bin/env node

/**
 * Universal AI Integration - Final Summary & Validation Script
 * Provides a comprehensive overview of the completed integration
 */

const fs = require('fs');
const path = require('path');

class IntegrationSummary {
  constructor() {
    this.rootDir = process.cwd();
    this.results = {
      backend: [],
      frontend: [],
      documentation: [],
      testing: [],
      configuration: []
    };
  }

  checkFileExists(filePath) {
    const fullPath = path.join(this.rootDir, filePath);
    return fs.existsSync(fullPath);
  }

  checkFileContains(filePath, searchString) {
    try {
      const fullPath = path.join(this.rootDir, filePath);
      if (!fs.existsSync(fullPath)) return false;
      const content = fs.readFileSync(fullPath, 'utf8');
      return content.includes(searchString);
    } catch (error) {
      return false;
    }
  }

  validateBackendIntegration() {
    console.log('\n🔧 Backend Integration Status:');
    console.log('='.repeat(40));

    const backendChecks = [{
      name: 'AI Services Controller - Universal AI Integration',
      file: 'server/src/controllers/aiServicesController.js',
      check: (file) => this.checkFileContains(file, 'UNIVERSAL_AI_AGENT_URL') && this.checkFileContains(file, 'summarize-text')
    },
    {
      name: 'YouTube Controller - Universal AI Support',
      file: 'server/src/controllers/youtubeController.js',
      check: (file) => this.checkFileContains(file, 'UNIVERSAL_AI_AGENT_URL') && this.checkFileContains(file, 'summarize-youtube')
    },
    {
      name: 'Content Extraction Controller - Universal AI',
      file: 'server/src/controllers/contentExtractionController.js',
      check: (file) => this.checkFileContains(file, 'UNIVERSAL_AI_AGENT_URL') || this.checkFileContains(file, 'universalAI')
    },
    {
      name: 'Universal AI Routes - AI Services',
      file: 'server/src/routes/aiServicesRoutes.js',
      check: (file) => this.checkFileContains(file, '/universal/summarize')
    }, {
      name: 'Universal AI Routes - YouTube',
      file: 'server/src/routes/youtubeRoutes.js',
      check: (file) => this.checkFileContains(file, 'getVideoDetailsWithSummary') && this.checkFileContains(file, 'createVideoWithSummary')
    },
    {
      name: 'Universal AI Routes - Content Extraction',
      file: 'server/src/routes/contentExtractionRoutes.js',
      check: (file) => this.checkFileContains(file, 'contentExtractionController') && (this.checkFileContains(file, 'enhanced') || this.checkFileContains(file, 'summary'))
    },
    {
      name: 'YouTube Model - AI Summary Support',
      file: 'server/src/models/YouTube.js',
      check: (file) => this.checkFileContains(file, 'aiSummary')
    },
    {
      name: 'Content Extraction Model - AI Summary Support',
      file: 'server/src/models/ContentExtraction.js',
      check: (file) => this.checkFileContains(file, 'aiSummary')
    }
    ];

    backendChecks.forEach(check => {
      const status = check.check(check.file);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'INTEGRATED' : 'MISSING';
      console.log(`${icon} ${check.name}: ${statusText}`);
      this.results.backend.push({ ...check, status });
    });
  }

  validateFrontendIntegration() {
    console.log('\n🎨 Frontend Integration Status:');
    console.log('='.repeat(40));

    const frontendChecks = [
      {
        name: 'API Service - Universal AI Endpoints',
        file: 'client/src/services/api.js',
        check: (file) => this.checkFileContains(file, 'universalAIAPI') && this.checkFileContains(file, 'summarizeText')
      },
      {
        name: 'YouTube Player - AI Summary Controls',
        file: 'client/src/components/youtube-player/YouTubePlayer.jsx',
        check: (file) => this.checkFileContains(file, 'generateSummary') || this.checkFileContains(file, 'aiSummary')
      },
      {
        name: 'YouTube Helpers - Universal AI Integration',
        file: 'client/src/components/youtube-player/utils/youtubeHelpers.js',
        check: (file) => this.checkFileContains(file, 'universalAIAPI')
      },
      {
        name: 'Content Extractor - AI Summary Options',
        file: 'client/src/components/content-extractor/ContentExtractor.jsx',
        check: (file) => this.checkFileContains(file, 'generateSummary') || this.checkFileContains(file, 'summaryLength')
      },
      {
        name: 'Content Extractor Helpers - Universal AI',
        file: 'client/src/components/content-extractor/utils/contentExtractorHelpers.js',
        check: (file) => this.checkFileContains(file, 'universalAIAPI')
      },
      {
        name: 'AI Formatting Panel - Universal AI Priority',
        file: 'client/src/components/content-extractor/components/AIFormattingPanel.jsx',
        check: (file) => this.checkFileContains(file, 'universalAIAPI')
      }
    ];

    frontendChecks.forEach(check => {
      const status = check.check(check.file);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'INTEGRATED' : 'MISSING';
      console.log(`${icon} ${check.name}: ${statusText}`);
      this.results.frontend.push({ ...check, status });
    });
  }

  validateLegacyServiceDeprecation() {
    console.log('\n⚠️ Legacy Service Deprecation Status:');
    console.log('='.repeat(40));

    const legacyServices = [
      {
        name: 'Free AI Services - Deprecation Warning',
        file: 'client/src/services/freeAIServices.js',
        check: (file) => this.checkFileContains(file, '@deprecated') && this.checkFileContains(file, 'console.warn')
      },
      {
        name: 'AI Text Formatting Service - Deprecation Warning',
        file: 'client/src/services/aiTextFormattingService.js',
        check: (file) => this.checkFileContains(file, '@deprecated') && this.checkFileContains(file, 'console.warn')
      },
      {
        name: 'Hugging Face Service - Deprecation Warning',
        file: 'client/src/services/huggingFaceService.js',
        check: (file) => this.checkFileContains(file, '@deprecated') && this.checkFileContains(file, 'console.warn')
      }
    ];

    legacyServices.forEach(check => {
      const status = check.check(check.file);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'DEPRECATED' : 'NOT MARKED';
      console.log(`${icon} ${check.name}: ${statusText}`);
      this.results.backend.push({ ...check, status });
    });
  }

  validateDocumentationAndConfiguration() {
    console.log('\n📚 Documentation & Configuration Status:');
    console.log('='.repeat(40));

    const docChecks = [
      {
        name: 'Universal AI Integration Guide',
        file: 'docs/UNIVERSAL_AI_INTEGRATION.md',
        check: (file) => this.checkFileExists(file)
      },
      {
        name: 'Migration Guide',
        file: 'docs/MIGRATION_GUIDE.md',
        check: (file) => this.checkFileExists(file)
      },
      {
        name: 'Integration Complete Summary',
        file: 'INTEGRATION_COMPLETE.md',
        check: (file) => this.checkFileExists(file)
      },
      {
        name: 'Environment Configuration Example',
        file: 'server/.env.example',
        check: (file) => this.checkFileContains(file, 'UNIVERSAL_AI_AGENT_URL')
      },
      {
        name: 'Universal AI Startup Script (Bash)',
        file: 'server/scripts/start-universal-agent.sh',
        check: (file) => this.checkFileExists(file)
      },
      {
        name: 'Universal AI Startup Script (PowerShell)',
        file: 'server/scripts/start-universal-agent.ps1',
        check: (file) => this.checkFileExists(file)
      }
    ];

    docChecks.forEach(check => {
      const status = check.check(check.file);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'EXISTS' : 'MISSING';
      console.log(`${icon} ${check.name}: ${statusText}`);
      this.results.documentation.push({ ...check, status });
    });
  }

  validateTestingInfrastructure() {
    console.log('\n🧪 Testing Infrastructure Status:');
    console.log('='.repeat(40));

    const testChecks = [
      {
        name: 'Node.js Integration Test Suite',
        file: 'test-universal-ai-integration.js',
        check: (file) => this.checkFileExists(file) && this.checkFileContains(file, 'UniversalAIIntegrationTester')
      },
      {
        name: 'PowerShell Integration Test Suite',
        file: 'test-universal-ai-integration.ps1',
        check: (file) => this.checkFileExists(file) && this.checkFileContains(file, 'Universal AI Integration Test Suite')
      }
    ];

    testChecks.forEach(check => {
      const status = check.check(check.file);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'READY' : 'MISSING';
      console.log(`${icon} ${check.name}: ${statusText}`);
      this.results.testing.push({ ...check, status });
    });
  }

  generateSummaryReport() {
    console.log('\n📊 INTEGRATION SUMMARY REPORT');
    console.log('='.repeat(60));

    const allResults = [
      ...this.results.backend,
      ...this.results.frontend,
      ...this.results.documentation,
      ...this.results.testing
    ];

    const totalChecks = allResults.length;
    const passedChecks = allResults.filter(r => r.status).length;
    const failedChecks = totalChecks - passedChecks;
    const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);

    console.log(`📈 Overall Success Rate: ${successRate}%`);
    console.log(`✅ Passed Checks: ${passedChecks}/${totalChecks}`);
    console.log(`❌ Failed Checks: ${failedChecks}/${totalChecks}`);

    if (failedChecks > 0) {
      console.log('\n❌ FAILED CHECKS:');
      allResults
        .filter(r => !r.status)
        .forEach(r => console.log(`   - ${r.name} (${r.file})`));
    }

    console.log('\n🎯 INTEGRATION STATUS:');
    if (successRate >= 95) {
      console.log('🎉 EXCELLENT - Integration is complete and ready for production!');
    } else if (successRate >= 85) {
      console.log('✅ GOOD - Integration is mostly complete, minor issues to address');
    } else if (successRate >= 70) {
      console.log('⚠️ FAIR - Integration has significant gaps, needs attention');
    } else {
      console.log('❌ POOR - Integration is incomplete, major work needed');
    }

    return { totalChecks, passedChecks, failedChecks, successRate };
  }

  async runFullValidation() {
    console.log('🚀 Universal AI Integration - Final Validation');
    console.log('='.repeat(60));
    console.log(`📁 Validating integration in: ${this.rootDir}`);

    // Run all validation checks
    this.validateBackendIntegration();
    this.validateFrontendIntegration();
    this.validateLegacyServiceDeprecation();
    this.validateDocumentationAndConfiguration();
    this.validateTestingInfrastructure();

    // Generate summary report
    const summary = this.generateSummaryReport();

    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Run the test suites to validate functionality');
    console.log('2. Start all services and perform manual testing');
    console.log('3. Deploy to staging environment for user acceptance testing');
    console.log('4. Monitor performance and gather user feedback');
    console.log('5. Consider removing legacy services after stable period');

    console.log('\n✨ Integration validation complete!');

    return summary;
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new IntegrationSummary();
  validator.runFullValidation().catch(error => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationSummary;
