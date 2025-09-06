const dotenv = require('dotenv');
dotenv.config();

const ClassifyAIAgent = require('../lib/ai-agent');

class AgentTester {
  constructor() {
    this.agent = new ClassifyAIAgent();
    this.testQueries = [
      // Course search queries
      "What computer science courses are available at Harvey Mudd?",
      "I want to study economics. What courses should I take at CMC?",
      "Show me introductory math courses across all Claremont Colleges",
      
      // Major planning queries
      "I want to major in Computer Science at Harvey Mudd. What are the requirements?",
      "Can I double major in CS and Math? What would that look like?",
      "What are the prerequisites for taking advanced algorithms?",
      
      // Schedule planning queries
      "Help me plan my freshman year schedule for a CS major",
      "I've taken Calculus 1 and Intro to Programming. What should I take next semester?",
      "Can you build me a 4-year plan for an Economics major at CMC?",
      
      // Cross-campus queries
      "What cross-campus opportunities are there for engineering students?",
      "I'm at Scripps but want to take some CS courses. What are my options?"
    ];
  }

  async runSingleTest(query, index) {
    console.log(`\n=== Test ${index + 1}: ${query} ===`);
    
    try {
      const startTime = Date.now();
      const result = await this.agent.processMessage(query);
      const endTime = Date.now();
      
      console.log(`⏱️  Response time: ${endTime - startTime}ms`);
      console.log(`🔧 Tools used: ${result.toolCalls.length}`);
      
      if (result.toolCalls.length > 0) {
        console.log(`📋 Tool calls:`);
        result.toolCalls.forEach(call => {
          console.log(`   - ${call.function.name}(${JSON.stringify(JSON.parse(call.function.arguments))})`);
        });
      }
      
      console.log(`🤖 AI Response:`);
      console.log(result.response);
      
      if (result.toolResults.length > 0) {
        console.log(`📊 Tool Results:`);
        result.toolResults.forEach((toolResult, i) => {
          console.log(`   ${i + 1}. ${toolResult.success ? '✅' : '❌'} ${toolResult.message || 'No message'}`);
        });
      }
      
      return { success: true, responseTime: endTime - startTime };
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Classify AI Agent Tests\n');
    
    const results = {
      total: this.testQueries.length,
      passed: 0,
      failed: 0,
      totalTime: 0,
      errors: []
    };

    for (let i = 0; i < this.testQueries.length; i++) {
      const query = this.testQueries[i];
      const result = await this.runSingleTest(query, i);
      
      if (result.success) {
        results.passed++;
        results.totalTime += result.responseTime;
      } else {
        results.failed++;
        results.errors.push({ query, error: result.error });
      }
      
      // Add delay between tests to avoid rate limiting
      if (i < this.testQueries.length - 1) {
        console.log('\n⏳ Waiting 2s before next test...');
        await this.delay(2000);
      }
    }

    this.printSummary(results);
    return results;
  }

  printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏱️  Average Response Time: ${Math.round(results.totalTime / results.passed)}ms`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. "${error.query}"`);
        console.log(`      Error: ${error.error}`);
      });
    }
    
    const successRate = Math.round((results.passed / results.total) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI usage
if (require.main === module) {
  const tester = new AgentTester();
  
  const testType = process.argv[2];
  const testIndex = parseInt(process.argv[3]);
  
  switch (testType) {
    case 'all':
      tester.runAllTests();
      break;
    case 'single':
      if (testIndex >= 0 && testIndex < tester.testQueries.length) {
        tester.runSingleTest(tester.testQueries[testIndex], testIndex);
      } else {
        console.log(`Invalid test index. Available: 0-${tester.testQueries.length - 1}`);
      }
      break;
    case 'list':
      console.log('Available test queries:');
      tester.testQueries.forEach((query, i) => {
        console.log(`${i}: ${query}`);
      });
      break;
    default:
      console.log('Usage: node agent-test.js [all|single|list] [testIndex]');
      console.log('Examples:');
      console.log('  node agent-test.js all');
      console.log('  node agent-test.js single 0');
      console.log('  node agent-test.js list');
  }
}

module.exports = AgentTester;