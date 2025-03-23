import { NextResponse } from 'next/server';
import { scrapeSurfConditions, areFavorableConditions } from '@/app/utils/scraper';
import { sendSurfAlert } from '@/app/utils/emailNotification';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

export async function GET() {
  try {
    // Get current conditions
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    
    // Check if conditions are favorable
    const isFavorable = areFavorableConditions(conditions, SURF_CONDITIONS);

    // If conditions are favorable, send notification
    if (isFavorable && SURF_CONDITIONS.notification.email) {
      await sendSurfAlert(conditions, SURF_CONDITIONS.notification.email);
    }

    return NextResponse.json({
      success: true,
      conditions,
      isFavorable,
      notificationSent: isFavorable && !!SURF_CONDITIONS.notification.email,
    });
  } catch (error) {
    console.error('Error checking surf forecast:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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