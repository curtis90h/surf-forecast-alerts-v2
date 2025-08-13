import nodemailer from 'nodemailer';
import { SMTP_CONFIG } from '@/app/config/surfConditions';

export const sendSurfAlert = async (conditions) => {
  try {
    // Only check for good conditions, ignore perfect
    const { isGood, beach, waveHeight, wavePeriod, windSpeed, windDirection, temperature, rating } = conditions;
    
    if (!isGood) {
      console.log('No good conditions found, skipping email');
      return;
    }

    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `🏄‍♂️ Surf Alert: Good conditions at ${beach}!`,
      html: `
        <h2>🏄‍♂️ Surf Alert!</h2>
        <p>Good surf conditions detected at <strong>${beach}</strong>!</p>
        
        <h3>Current Conditions:</h3>
        <ul>
          <li><strong>Wave Height:</strong> ${waveHeight}m</li>
          <li><strong>Wave Period:</strong> ${wavePeriod}s</li>
          <li><strong>Wind Speed:</strong> ${windSpeed} km/h</li>
          <li><strong>Wind Direction:</strong> ${windDirection}</li>
          <li><strong>Water Temperature:</strong> ${temperature}°C</li>
          <li><strong>Rating:</strong> ${rating}</li>
        </ul>
        
        <p><em>Check time: ${new Date().toLocaleString()}</em></p>
        
        <p>Time to grab your board and hit the waves! 🏄‍♀️</p>
      `,
      text: `
        Surf Alert! Good conditions at ${beach}!
        
        Current Conditions:
        - Wave Height: ${waveHeight}m
        - Wave Period: ${wavePeriod}s
        - Wind Speed: ${windSpeed} km/h
        - Wind Direction: ${windDirection}
        - Water Temperature: ${temperature}°C
        - Rating: ${rating}
        
        Check time: ${new Date().toLocaleString()}
        
        Time to grab your board and hit the waves!
      `
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 