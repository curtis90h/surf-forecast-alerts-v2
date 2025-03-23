import emailjs from '@emailjs/browser';

const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

export const sendSurfAlert = async (conditions) => {
  try {
    // Initialize EmailJS with your public key
    emailjs.init(EMAIL_CONFIG.publicKey);

    // Format the conditions that are good/perfect
    const goodTimes = [];
    const perfectTimes = [];

    Object.entries(conditions.detailedForecast).forEach(([day, periods]) => {
      Object.entries(periods).forEach(([timeOfDay, data]) => {
        if (!data) return;
        
        const date = data.formattedDate;
        const time = timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
        const details = `${date} ${time}`;

        if (data.isPerfect) {
          perfectTimes.push(details);
        } else if (data.isGood) {
          goodTimes.push(details);
        }
      });
    });

    // Only send email if there are good or perfect conditions
    if (goodTimes.length === 0 && perfectTimes.length === 0) {
      console.log('No good or perfect conditions found, skipping email');
      return;
    }

    // Create email content
    const templateParams = {
      perfect_conditions: perfectTimes.join('\n'),
      good_conditions: goodTimes.join('\n'),
      website_url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://your-site-url.netlify.app',
      beach_name: conditions.beach || 'your beach',
    };

    // Send the email
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 