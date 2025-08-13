require('dotenv').config({ path: '.env.local' });
const { sendEmailAlert } = require('./surfCheck');

async function testEmail() {
  console.log('📧 Testing email functionality...');
  
  try {
    // Create mock conditions that would trigger an email
    const mockConditions = {
      waveHeight: 1.5,
      wavePeriod: 16,
      waveDirection: 'SSW',
      windSpeed: 8,
      windDirection: 'NE',
      isGood: true,
      isPerfect: true
    };
    
    const beach = process.env.TARGET_BEACH || 'Long-Beach_6';
    
    console.log('Sending test email with conditions:', mockConditions);
    console.log(`To: curtis90h@gmail.com`);
    console.log(`From: ${process.env.SMTP_USER}`);
    
    await sendEmailAlert(mockConditions, beach);
    
    console.log('✅ Test email sent successfully!');
    console.log('Check your email at curtis90h@gmail.com');
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testEmail();
