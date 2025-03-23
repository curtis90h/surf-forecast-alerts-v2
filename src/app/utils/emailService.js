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

    // Check if conditions are good or perfect
    const { isGood, isPerfect } = conditions;
    
    if (!isGood && !isPerfect) {
      console.log('No good or perfect conditions found, skipping email');
      return;
    }

    // Send the email
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      {} // No template variables needed since the template is static
    );

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}; 