// Configuration for surf conditions and EmailJS
export const SURF_CONDITIONS = {
  beach: process.env.NEXT_PUBLIC_TARGET_BEACH || 'default-beach',
  good: {
    waveHeight: {
      min: 1,
      max: 2,
    },
    wave: {
      preferredDirections: ['S', 'SSW', 'SW', 'WSW', 'W'],
      periodMin: 12,
      periodMax: 21,
    },
    wind: {
      maxSpeed: 20,
    },
  },
  perfect: {
    waveHeight: {
      min: 1,
      max: 1.5,
    },
    wave: {
      preferredDirections: ['S', 'SSW', 'SW'],
      periodMin: 15,
      periodMax: 21,
    },
    wind: {
      maxSpeed: 10,
      // For perfect conditions, we want strictly offshore ±1 direction
      directionTolerance: 1, // This means only 1 step from perfect offshore
    },
  },
  notification: {
    email: process.env.NOTIFICATION_EMAIL,
    frequency: process.env.CHECK_FREQUENCY || '0 */6 * * *', // Every 6 hours by default
  },
};

// Cardinal and intercardinal directions in clockwise order
const DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 
  'E', 'ESE', 'SE', 'SSE', 
  'S', 'SSW', 'SW', 'WSW', 
  'W', 'WNW', 'NW', 'NNW'
];

// Helper function to get index of direction
function getDirectionIndex(direction) {
  return DIRECTIONS.indexOf(direction);
}

// Helper function to check if wind direction is favorable relative to swell
export function isWindDirectionFavorable(swellDirection, windDirection, tolerance = 2) {
  if (!swellDirection || !windDirection) return false;
  
  const swellIndex = getDirectionIndex(swellDirection);
  const windIndex = getDirectionIndex(windDirection);
  
  if (swellIndex === -1 || windIndex === -1) return false;
  
  // Calculate the difference in direction (0-16)
  let diff = (windIndex - swellIndex + 16) % 16;
  
  // For perfect conditions: only accept offshore (opposite direction) with ±tolerance
  // Perfect offshore is 8 positions away, acceptable range is 8 ± tolerance
  const offshoreMinDiff = (8 - tolerance + 16) % 16;
  const offshoreMaxDiff = (8 + tolerance + 16) % 16;
  
  // Handle the case where ranges wrap around 0
  let isOffshore = false;
  
  if (offshoreMinDiff <= offshoreMaxDiff) {
    // No wrapping
    isOffshore = diff >= offshoreMinDiff && diff <= offshoreMaxDiff;
  } else {
    // Wrapping case
    isOffshore = diff >= offshoreMinDiff || diff <= offshoreMaxDiff;
  }
  
  return isOffshore;
}

export const EMAIL_CONFIG = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  userId: process.env.EMAILJS_USER_ID,
  accessToken: process.env.EMAILJS_ACCESS_TOKEN,
};

export const SURF_FORECAST_URL = process.env.NEXT_PUBLIC_SURF_FORECAST_URL || 'https://www.surf-forecast.com'; 