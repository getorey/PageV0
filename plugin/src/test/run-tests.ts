import { WorkflowTester } from './WorkflowTester';

async function runTests() {
  console.log('🧪 Starting AI Work Automation Agent Tests...\n');
  
  const tester = new WorkflowTester();
  const results = await tester.runAllTests();
  
  const report = tester.generateTestReport(results);
  console.log(report);
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  if (passed === total) {
    console.log('\n✅ All tests passed! The AI Work Automation Agent is ready.');
    process.exit(0);
  } else {
    console.log(`\n❌ ${total - passed} test(s) failed. Please review the issues.`);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { runTests };