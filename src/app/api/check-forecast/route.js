import { NextResponse } from 'next/server';
import { scrapeSurfConditions, areFavorableConditions } from '@/app/utils/scraper';
import { sendSurfAlert } from '@/app/utils/emailService';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

// In-memory store for last check time, cached results, and rate limiting
let lastCheckTime = 0;
let cachedConditions = null;
let cacheTimestamp = 0;
const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Rate limiting by IP
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIP || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const requests = ipRequests.get(ip) || [];
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  // Add current request
  recentRequests.push(now);
  ipRequests.set(ip, recentRequests);
  
  return false;
}

async function handleForecastCheck(request, isScheduled = false) {
  try {
    const now = Date.now();
    
    // Rate limiting (skip for scheduled checks)
    if (!isScheduled) {
      const clientIP = getClientIP(request);
      if (isRateLimited(clientIP)) {
        return NextResponse.json({
          success: false,
          error: 'Too many requests. Please try again later.',
        }, { status: 429 });
      }
    }
    
    // For scheduled checks, always fetch fresh data
    if (isScheduled) {
      console.log('Scheduled check - fetching fresh data for beach:', SURF_CONDITIONS.beach);
      const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
      const { isGood, isPerfect } = areFavorableConditions(conditions, SURF_CONDITIONS);
      
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
      
      return NextResponse.json({
        success: true,
        conditions: {
          ...conditions,
          isGood,
          isPerfect
        }
      });
    }
    
    // For manual checks, use cache if available and fresh
    if (cachedConditions && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Returning cached conditions (age:', Math.round((now - cacheTimestamp) / 60000), 'minutes)');
      return NextResponse.json({
        success: true,
        conditions: cachedConditions,
        cached: true
      });
    }
    
    // Check cooldown period for non-scheduled checks
    if (now - lastCheckTime < COOLDOWN_PERIOD) {
      const minutesRemaining = Math.ceil((COOLDOWN_PERIOD - (now - lastCheckTime)) / 60000);
      return NextResponse.json({
        success: false,
        error: `Please wait ${minutesRemaining} minutes before checking again`,
        cooldownRemaining: minutesRemaining
      }, { status: 429 });
    }

    console.log('Fetching fresh conditions for beach:', SURF_CONDITIONS.beach);
    
    // Update last check time
    lastCheckTime = now;
    
    // Get current conditions
    const conditions = await scrapeSurfConditions(SURF_CONDITIONS.beach);
    const { isGood, isPerfect } = areFavorableConditions(conditions, SURF_CONDITIONS);
    
    // Cache the results
    cachedConditions = {
      ...conditions,
      isGood,
      isPerfect
    };
    cacheTimestamp = now;
    
    return NextResponse.json({
      success: true,
      conditions: cachedConditions
    });
  } catch (error) {
    console.error('Error in forecast API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return handleForecastCheck(request, false);
}

export async function POST(request) {
  const body = await request.json();
  return handleForecastCheck(request, body.checkType === 'scheduled');
} 