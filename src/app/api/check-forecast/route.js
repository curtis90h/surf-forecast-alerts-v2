import { NextResponse } from 'next/server';
import { checkSurfConditions } from '@/utils/surfCheck';

// Rate limiting and caching
const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes between manual checks
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache duration

// Rate limiting by IP
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 requests per minute per IP

// In-memory store for caching
let lastCheckTime = 0;
let cachedConditions = null;
let cacheTimestamp = 0;

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  return forwarded ? forwarded.split(',')[0] : realIP || 'unknown';
}

function isRateLimited(clientIP) {
  const now = Date.now();
  const userRequests = ipRequests.get(clientIP) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  recentRequests.push(now);
  ipRequests.set(clientIP, recentRequests);
  return false;
}

export async function GET(request) {
  try {
    const isScheduled = request.headers.get('x-scheduled') === 'true';
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
      console.log('Scheduled check - fetching fresh data');
      const result = await checkSurfConditions();
      
      if (result.success) {
        return NextResponse.json(result);
      } else {
        throw new Error('Scheduled check failed');
      }
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

    console.log('Fetching fresh conditions');
    
    // Update last check time
    lastCheckTime = now;
    
    const result = await checkSurfConditions();
    
    if (result.success) {
      // Cache the results in the format the frontend expects
      cachedConditions = {
        // Current conditions
        waveHeight: result.conditions.waveHeight,
        wavePeriod: result.conditions.wavePeriod,
        waveDirection: result.conditions.waveDirection,
        windSpeed: result.conditions.windSpeed,
        windDirection: result.conditions.windDirection,
        timestamp: result.conditions.timestamp,
        isGood: result.conditions.isGood,
        isPerfect: result.conditions.isPerfect,
        
        // Detailed forecast for the 7-day table
        detailedForecast: result.forecastData ? result.forecastData.reduce((acc, dayData, index) => {
          const dayKey = `day${index + 1}`;
          acc[dayKey] = {
            morning: dayData.morning ? {
              wave: {
                height: dayData.morning.waveHeight,
                direction: dayData.morning.waveDirection,
                period: dayData.morning.wavePeriod
              },
              wind: {
                speed: dayData.morning.windSpeed,
                direction: dayData.morning.windDirection
              },
              isGood: dayData.morning.isGood,
              isPerfect: dayData.morning.isPerfect,
              formattedDate: dayData.date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            } : null,
            afternoon: dayData.afternoon ? {
              wave: {
                height: dayData.afternoon.waveHeight,
                direction: dayData.afternoon.waveDirection,
                period: dayData.afternoon.wavePeriod
              },
              wind: {
                speed: dayData.afternoon.windSpeed,
                direction: dayData.afternoon.windDirection
              },
              isGood: dayData.afternoon.isGood,
              isPerfect: dayData.afternoon.isPerfect,
              formattedDate: dayData.date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            } : null,
            night: dayData.evening ? {
              wave: {
                height: dayData.evening.waveHeight,
                direction: dayData.evening.waveDirection,
                period: dayData.evening.wavePeriod
              },
              wind: {
                speed: dayData.evening.windSpeed,
                direction: dayData.evening.windDirection
              },
              isGood: dayData.evening.isGood,
              isPerfect: dayData.evening.isPerfect,
              formattedDate: dayData.date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })
            } : null
          };
          return acc;
        }, {}) : {}
      };
      cacheTimestamp = now;
      
      return NextResponse.json({
        success: true,
        conditions: cachedConditions
      });
    } else {
      throw new Error('Failed to fetch conditions');
    }

  } catch (error) {
    console.error('Error in forecast check:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}

 