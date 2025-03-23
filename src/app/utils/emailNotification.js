import { init, send } from 'emailjs-com';
import { EMAIL_CONFIG } from '@/app/config/surfConditions';

// Initialize EmailJS with user ID
init(EMAIL_CONFIG.userId);

/**
 * Sends a surf conditions notification email
 * @param {Object} conditions - Current surf conditions
 * @param {string} recipientEmail - Email address to send notification to
 * @returns {Promise<void>}
 */
export async function sendSurfAlert(conditions, recipientEmail) {
  try {
    const templateParams = {
      to_email: recipientEmail,
      beach_name: conditions.beach,
      wave_height: `${conditions.waveHeight} ft`,
      wind_speed: `${conditions.windSpeed} mph`,
      wind_direction: conditions.windDirection,
      timestamp: new Date(conditions.timestamp).toLocaleString(),
    };

    await send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.accessToken
    );

    console.log('Surf alert email sent successfully');
  } catch (error) {
    console.error('Error sending surf alert email:', error);
    throw new Error(`Failed to send surf alert email: ${error.message}`);
  }
} 