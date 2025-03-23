import { NextResponse } from 'next/server';
import { scrapeSurfConditions, areFavorableConditions } from '@/app/utils/scraper';
import { sendSurfAlert } from '@/app/utils/emailNotification';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

export async function GET() {
  try {
    console.log('Starting forecast check for beach:', SURF_CONDITIONS.beach);
    
    // Get current conditions
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    console.log('Scraped conditions:', conditions);
    
    // Check if conditions are favorable
    const isFavorable = areFavorableConditions(conditions, SURF_CONDITIONS);
    console.log('Conditions favorable:', isFavorable);

    // If conditions are favorable, send notification
    if (isFavorable && SURF_CONDITIONS.notification.email) {
      await sendSurfAlert(conditions, SURF_CONDITIONS.notification.email);
      console.log('Notification sent');
    }

    return NextResponse.json({
      success: true,
      conditions,
      isFavorable,
      notificationSent: isFavorable && !!SURF_CONDITIONS.notification.email,
    });
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method to manually trigger checks or update preferences
export async function POST(request) {
  try {
    const body = await request.json();
    const conditions = await scrapeSurfConditions(body.beach || SURF_CONDITIONS.beach);
    
    return NextResponse.json({
      success: true,
      conditions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 