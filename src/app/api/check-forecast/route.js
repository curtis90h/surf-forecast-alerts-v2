import { NextResponse } from 'next/server';
import { scrapeSurfConditions, areFavorableConditions } from '@/app/utils/scraper';
import { sendSurfAlert } from '@/app/utils/emailService';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

// In-memory store for last check time
let lastCheckTime = 0;
const COOLDOWN_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds

async function handleForecastCheck(isScheduled = false) {
  try {
    // Check cooldown period for non-scheduled checks
    const now = Date.now();
    if (!isScheduled && now - lastCheckTime < COOLDOWN_PERIOD) {
      const minutesRemaining = Math.ceil((COOLDOWN_PERIOD - (now - lastCheckTime)) / 60000);
      return NextResponse.json({
        success: false,
        error: `Please wait ${minutesRemaining} minutes before checking again`,
        cooldownRemaining: minutesRemaining
      }, { status: 429 });
    }

    console.log('Starting forecast check for beach:', SURF_CONDITIONS.beach);
    
    // Update last check time for non-scheduled checks
    if (!isScheduled) {
      lastCheckTime = now;
    }
    
    // Get current conditions
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    
    // Check if conditions are favorable
    const { isGood, isPerfect } = areFavorableConditions(conditions, SURF_CONDITIONS);

    // Only send email for scheduled checks
    if (isScheduled) {
      try {
        await sendSurfAlert({
          ...conditions,
          isGood,
          isPerfect,
          beach: SURF_CONDITIONS.beach
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }
    
    return NextResponse.json({
      success: true,
      conditions: {
        ...conditions,
        isGood,
        isPerfect
      }
    });
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return handleForecastCheck(false);
}

export async function POST(request) {
  const body = await request.json();
  return handleForecastCheck(body.checkType === 'scheduled');
} 