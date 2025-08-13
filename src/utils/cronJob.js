require('dotenv').config({ path: '.env.local' });
const cron = require('node-cron');
const { checkSurfConditions } = require('./surfCheck');

// Schedule surf check to run daily at 6:00 AM
const SURF_CHECK_SCHEDULE = process.env.SURF_CHECK_SCHEDULE || '0 6 * * *';

console.log('Setting up daily surf check cron job...');
console.log(`Schedule: ${SURF_CHECK_SCHEDULE} (daily at 6:00 AM)`);

// Initialize the cron job
const surfCheckJob = cron.schedule(SURF_CHECK_SCHEDULE, async () => {
  console.log('🕕 Daily surf check triggered by cron job');
  
  try {
    const result = await checkSurfConditions();
    console.log('✅ Daily surf check completed successfully:', result);
  } catch (error) {
    console.error('❌ Daily surf check failed:', error.message);
    // Don't exit the process, just log the error and continue
  }
}, {
  scheduled: true,
  timezone: process.env.TIMEZONE || 'America/Los_Angeles'
});

// Start the cron job
surfCheckJob.start();
console.log('✅ Daily surf check cron job started successfully');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down surf check cron job...');
  surfCheckJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down surf check cron job...');
  surfCheckJob.stop();
  process.exit(0);
});

// Export for testing purposes
module.exports = { surfCheckJob };
