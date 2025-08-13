import nodemailer from 'nodemailer';
import { SMTP_CONFIG } from '@/app/config/surfConditions';

/**
 * Sends a surf conditions notification email
 * @param {Object} conditions - Current surf conditions
 * @param {string} recipientEmail - Email address to send notification to
 * @returns {Promise<void>}
 */
export async function sendSurfAlert(conditions, recipientEmail) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: recipientEmail,
      subject: `🏄‍♂️ Surf Alert: Good conditions at ${conditions.beach}!`,
      html: `
        <h2>🏄‍♂️ Surf Alert!</h2>
        <p>Good surf conditions detected at <strong>${conditions.beach}</strong>!</p>
        
        <h3>Current Conditions:</h3>
        <ul>
          <li><strong>Wave Height:</strong> ${conditions.waveHeight}m</li>
          <li><strong>Wave Period:</strong> ${conditions.wavePeriod}s</li>
          <li><strong>Wind Speed:</strong> ${conditions.windSpeed} km/h</li>
          <li><strong>Wind Direction:</strong> ${conditions.windDirection}</li>
          <li><strong>Water Temperature:</strong> ${conditions.temperature}°C</li>
          <li><strong>Rating:</strong> ${conditions.rating}</li>
        </ul>
        
        <p><em>Check time: ${new Date(conditions.timestamp).toLocaleString()}</em></p>
        
        <p>Time to grab your board and hit the waves! 🏄‍♀️</p>
      `,
      text: `
        Surf Alert! Good conditions at ${conditions.beach}!
        
        Current Conditions:
        - Wave Height: ${conditions.waveHeight}m
        - Wave Period: ${conditions.wavePeriod}s
        - Wind Speed: ${conditions.windSpeed} km/h
        - Wind Direction: ${conditions.windDirection}
        - Water Temperature: ${conditions.temperature}°C
        - Rating: ${conditions.rating}
        
        Check time: ${new Date(conditions.timestamp).toLocaleString()}
        
        Time to grab your board and hit the waves!
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Surf alert email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending surf alert email:', error);
    throw new Error(`Failed to send surf alert email: ${error.message}`);
  }
} 