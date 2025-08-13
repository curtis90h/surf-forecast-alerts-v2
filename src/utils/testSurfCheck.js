require('dotenv').config({ path: '.env.local' });
const { checkSurfConditions } = require('./surfCheck');

async function testSurfCheck() {
  console.log('🧪 Testing surf check functionality...');
  
  try {
    const result = await checkSurfConditions();
    console.log('✅ Test completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testSurfCheck();
