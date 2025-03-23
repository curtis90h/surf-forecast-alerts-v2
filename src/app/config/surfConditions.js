// Configuration for surf conditions and EmailJS
export const SURF_CONDITIONS = {
  beach: process.env.NEXT_PUBLIC_TARGET_BEACH || 'default-beach',
  waveHeight: {
    min: parseFloat(process.env.NEXT_PUBLIC_MIN_WAVE_HEIGHT || '2'),
    max: parseFloat(process.env.NEXT_PUBLIC_MAX_WAVE_HEIGHT || '6'),
  },
  wind: {
    maxSpeed: parseFloat(process.env.NEXT_PUBLIC_MAX_WIND_SPEED || '15'),
    preferredDirections: (process.env.NEXT_PUBLIC_PREFERRED_WIND_DIRECTIONS || 'offshore').split(','),
  },
  notification: {
    email: process.env.NOTIFICATION_EMAIL,
    frequency: process.env.CHECK_FREQUENCY || '0 */6 * * *', // Every 6 hours by default
  },
};

export const EMAIL_CONFIG = {
  serviceId: process.env.EMAILJS_SERVICE_ID,
  templateId: process.env.EMAILJS_TEMPLATE_ID,
  userId: process.env.EMAILJS_USER_ID,
  accessToken: process.env.EMAILJS_ACCESS_TOKEN,
};

export const SURF_FORECAST_URL = process.env.NEXT_PUBLIC_SURF_FORECAST_URL || 'https://www.surf-forecast.com'; 