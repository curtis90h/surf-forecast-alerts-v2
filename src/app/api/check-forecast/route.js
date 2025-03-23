import { NextResponse } from 'next/server';
import { scrapeSurfConditions, areFavorableConditions } from '@/app/utils/scraper';
import { sendSurfAlert } from '@/app/utils/emailService';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

export async function GET() {
  try {
    console.log('Starting forecast check for beach:', SURF_CONDITIONS.beach);
    console.log('Using forecast URL:', process.env.NEXT_PUBLIC_SURF_FORECAST_URL);
    
    // Get current conditions
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    console.log('Raw scraped conditions:', conditions);
    
    // Check if conditions are favorable
    const { isGood, isPerfect } = areFavorableConditions(conditions, SURF_CONDITIONS);
    console.log('Conditions check:', {
      waveHeightGood: conditions.waveHeight >= SURF_CONDITIONS.good.waveHeight.min && 
                      conditions.waveHeight <= SURF_CONDITIONS.good.waveHeight.max,
      wavePeriodGood: conditions.wavePeriod >= SURF_CONDITIONS.good.wave.periodMin && 
                      conditions.wavePeriod <= SURF_CONDITIONS.good.wave.periodMax,
      waveDirectionGood: SURF_CONDITIONS.good.wave.preferredDirections.includes(conditions.waveDirection),
      windSpeedGood: conditions.windSpeed <= SURF_CONDITIONS.good.wind.maxSpeed,
      isGood,
      isPerfect
    });

    return NextResponse.json({
      success: true,
      conditions: {
        ...conditions,
        isGood,
        isPerfect
      },
      debug: {
        beach: SURF_CONDITIONS.beach,
        criteria: {
          good: {
            waveHeight: SURF_CONDITIONS.good.waveHeight,
            wavePeriod: {
              min: SURF_CONDITIONS.good.wave.periodMin,
              max: SURF_CONDITIONS.good.wave.periodMax
            },
            waveDirections: SURF_CONDITIONS.good.wave.preferredDirections,
            windSpeed: SURF_CONDITIONS.good.wind.maxSpeed
          },
          perfect: {
            waveHeight: SURF_CONDITIONS.perfect.waveHeight,
            wavePeriod: {
              min: SURF_CONDITIONS.perfect.wave.periodMin,
              max: SURF_CONDITIONS.perfect.wave.periodMax
            },
            waveDirections: SURF_CONDITIONS.perfect.wave.preferredDirections,
            windSpeed: SURF_CONDITIONS.perfect.wind.maxSpeed
          }
        }
      }
    });
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        debug: {
          beach: SURF_CONDITIONS.beach,
          url: process.env.NEXT_PUBLIC_SURF_FORECAST_URL
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST method to manually trigger checks or update preferences
export async function POST(request) {
  try {
    const body = await request.json();
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    const { isGood, isPerfect } = areFavorableConditions(conditions, SURF_CONDITIONS);
    
    // If this is a scheduled check, attempt to send email notification
    if (body.checkType === 'scheduled') {
      try {
        await sendSurfAlert({
          ...conditions,
          isGood,
          isPerfect,
          beach: SURF_CONDITIONS.beach
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email fails
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 