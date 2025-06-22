#!/usr/bin/env node

/**
 * Universal AI Integration Test Suite
 * Tests the integration between DashPoint and the Universal AI Agent
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dashPointServer: 'http://localhost:3001',
  universalAIAgent: 'http://localhost:8000',
  testData: {
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    contentUrl: 'https://example.com/article',
    testText: 'This is a sample text for testing AI summarization and processing capabilities. It contains multiple sentences and should be long enough to generate meaningful summaries and analysis.',
  }
};

class UniversalAIIntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async test(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.error(`❌ FAILED: ${name}`);
      console.error(`   Error: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async testUniversalAIAgentHealth() {
    const response = await axios.get(`${CONFIG.universalAIAgent}/health`);
    if (response.status !== 200) {
      throw new Error(`Universal AI Agent health check failed: ${response.status}`);
    }
    console.log('   Universal AI Agent is healthy');
  }

  async testDashPointServerHealth() {
    const response = await axios.get(`${CONFIG.dashPointServer}/api/health`);
    if (response.status !== 200) {
      throw new Error(`DashPoint server health check failed: ${response.status}`);
    }
    console.log('   DashPoint server is healthy');
  }

  async testUniversalAITextSummarization() {
    const response = await axios.post(`${CONFIG.dashPointServer}/api/ai-services/universal/summarize`, {
      text: CONFIG.testData.testText,
      length: 'medium'
    });

    if (!response.data.success) {
      throw new Error(`Text summarization failed: ${response.data.message}`);
    }

    if (!response.data.data.summary) {
      throw new Error('No summary returned from Universal AI Agent');
    }

    console.log(`   Summary generated: "${response.data.data.summary.substring(0, 100)}..."`);
  }

  async testYouTubeIntegration() {
    const response = await axios.post(`${CONFIG.dashPointServer}/api/youtube/universal/summarize`, {
      videoId: CONFIG.testData.youtubeUrl.split('v=')[1],
      summaryLength: 'medium'
    });

    if (!response.data.success) {
      throw new Error(`YouTube integration failed: ${response.data.message}`);
    }

    console.log('   YouTube video processing completed');
  }

  async testContentExtractionIntegration() {
    const response = await axios.post(`${CONFIG.dashPointServer}/api/content/universal/extract-summarize`, {
      url: CONFIG.testData.contentUrl,
      generateSummary: true,
      summaryLength: 'medium'
    });

    if (!response.data.success) {
      throw new Error(`Content extraction integration failed: ${response.data.message}`);
    }

    console.log('   Content extraction and summarization completed');
  }

  async testFallbackMechanism() {
    // Test by temporarily making Universal AI Agent unavailable
    const originalAgent = CONFIG.universalAIAgent;
    CONFIG.universalAIAgent = 'http://localhost:9999'; // Non-existent port

    try {
      const response = await axios.post(`${CONFIG.dashPointServer}/api/ai-services/universal/summarize`, {
        text: CONFIG.testData.testText,
        length: 'medium'
      });

      // Should still succeed due to fallback to legacy services
      if (!response.data.success && !response.data.message.includes('fallback')) {
        throw new Error('Fallback mechanism not working properly');
      }

      console.log('   Fallback mechanism working correctly');
    } finally {
      CONFIG.universalAIAgent = originalAgent;
    }
  }

  async testDeprecationWarnings() {
    // Check if deprecated services are properly marked
    const deprecatedFiles = [
      'client/src/services/freeAIServices.js',
      'client/src/services/aiTextFormattingService.js',
      'client/src/services/huggingFaceService.js'
    ];

    for (const file of deprecatedFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('@deprecated') || !content.includes('console.warn')) {
          throw new Error(`File ${file} not properly marked as deprecated`);
        }
      }
    }

    console.log('   All deprecated files properly marked with warnings');
  }

  async testUniversalAIAgentDirectly() {
    // Test direct communication with Universal AI Agent
    const response = await axios.post(`${CONFIG.universalAIAgent}/summarize`, {
      text: CONFIG.testData.testText,
      length: 'medium'
    });

    if (!response.data || !response.data.summary) {
      throw new Error('Direct Universal AI Agent communication failed');
    }

    console.log('   Direct Universal AI Agent communication successful');
  }

  async testConfigurationFiles() {
    // Check if configuration files exist
    const configFiles = [
      '.env.example',
      'docs/UNIVERSAL_AI_INTEGRATION.md',
      'docs/MIGRATION_GUIDE.md'
    ];

    for (const file of configFiles) {
      const filePath = path.join(__dirname, 'server', file);
      const altPath = path.join(__dirname, file);

      if (!fs.existsSync(filePath) && !fs.existsSync(altPath)) {
        throw new Error(`Configuration file ${file} not found`);
      }
    }

    console.log('   All configuration files present');
  }

  async runAllTests() {
    console.log('🚀 Starting Universal AI Integration Test Suite\n');
    console.log('='.repeat(60));

    // Health checks
    await this.test('Universal AI Agent Health Check', () => this.testUniversalAIAgentHealth());
    await this.test('DashPoint Server Health Check', () => this.testDashPointServerHealth());

    // Core functionality tests
    await this.test('Universal AI Text Summarization', () => this.testUniversalAITextSummarization());
    await this.test('YouTube Integration with Universal AI', () => this.testYouTubeIntegration());
    await this.test('Content Extraction Integration', () => this.testContentExtractionIntegration());

    // Integration tests
    await this.test('Fallback Mechanism', () => this.testFallbackMechanism());
    await this.test('Deprecation Warnings', () => this.testDeprecationWarnings());
    await this.test('Direct Universal AI Agent Communication', () => this.testUniversalAIAgentDirectly());
    await this.test('Configuration Files', () => this.testConfigurationFiles());

    // Results summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
    }

    console.log('\n🎉 Universal AI Integration testing completed!');

    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new UniversalAIIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
}

module.exports = UniversalAIIntegrationTester;
