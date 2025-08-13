# Surf Forecast Alerts

A Next.js application that monitors surf conditions and sends email alerts when conditions are favorable.

## Features

- 🌊 Real-time surf condition monitoring
- 📧 Email notifications for good surf conditions
- 🚀 Next.js 15 with App Router
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- ⚡ API rate limiting and caching

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd surf-forecast
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Notification Settings
NOTIFICATION_EMAIL=recipient@example.com

# Surf Conditions Configuration
SURF_BEACH=your-beach-name
SURF_FORECAST_URL=https://www.surf-forecast.com
```

### SMTP Setup

#### Gmail
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use your Gmail address and the generated app password

#### Other SMTP Services
- **SendGrid**: Use `smtp.sendgrid.net` as host
- **Outlook**: Use `smtp-mail.outlook.com` as host
- **Custom SMTP**: Configure according to your provider's settings

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

### GET `/api/check-forecast`
Manually check surf conditions (with rate limiting)

### POST `/api/check-forecast`
Check surf conditions with scheduled execution

```json
{
  "checkType": "scheduled"
}
```

## Configuration

### Surf Conditions Criteria

Edit `src/app/config/surfConditions.js` to customize your surf preferences:

- Wave height ranges
- Wave period preferences
- Wind speed limits
- Preferred wind directions
- Beach location

## GitHub Actions Workflow

The application includes a GitHub Actions workflow for automated surf condition checking. The workflow:

1. Runs daily at 6:00 AM UTC
2. Checks surf conditions for your configured beach
3. Sends email notifications if conditions are favorable
4. Uses Node.js 18+ for compatibility

### Workflow Setup

1. Add your environment variables to GitHub Secrets:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `NOTIFICATION_EMAIL`

2. The workflow will automatically run daily and send alerts

## Troubleshooting

### Email Not Sending
- Verify SMTP credentials
- Check firewall/network restrictions
- Ensure app passwords are correct (for Gmail)

### Node.js Compatibility Issues
- The application now uses `nodemailer` instead of browser-specific EmailJS
- All dependencies are Node.js compatible
- Tested with Node.js 18+ environments

### Rate Limiting
- API endpoints have built-in rate limiting
- Manual checks are limited to once per 5 minutes
- Scheduled checks bypass rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
