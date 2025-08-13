# Surf Check Setup Guide

## Overview
This is a completely rewritten, simplified surf check system that runs daily and sends email alerts when good surf conditions are detected.

## Features
- ✅ Simple, reliable surf condition checking
- ✅ Daily automated checks via cron job
- ✅ Email alerts to curtis90h@gmail.com when conditions are met
- ✅ Configurable surf criteria (good vs perfect conditions)
- ✅ Robust error handling and logging

## Environment Variables Required

Create a `.env.local` file in your project root with:

```bash
# Surf Forecast Configuration
SURF_FORECAST_URL=https://www.surf-forecast.com
TARGET_BEACH=your-beach-name-here

# SMTP Configuration for Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cron Job Configuration (optional)
SURF_CHECK_SCHEDULE=0 6 * * *
TIMEZONE=America/Los_Angeles
```

## Surf Criteria

### Good Conditions
- Wave height: 1-2m
- Wave period: 12-21s
- Wave direction: S, SSW, SW, WSW, W
- Wind speed: ≤20km/h
- Wind direction: Any if ≤10km/h, offshore ±3 if 10-20km/h

### Perfect Conditions
- Wave height: 1-1.5m
- Wave period: 15-21s
- Wave direction: S, SSW, SW
- Wind speed: ≤10km/h
- Wind direction: Offshore ±2

## Usage

### Manual Test
```bash
node src/utils/testSurfCheck.js
```

### Run Cron Job
```bash
node src/utils/cronJob.js
```

### Run Single Check
```bash
node src/utils/surfCheck.js
```

## Cron Job Setup

The system includes a cron job that runs daily at 6:00 AM by default. You can:

1. **Run as a service**: Use PM2 or similar process manager
2. **System cron**: Add to your system's crontab
3. **Docker**: Run in a container with the cron job

## Troubleshooting

### Common Issues
1. **Missing environment variables**: Check all required vars are set
2. **SMTP authentication**: Ensure app password is correct for Gmail
3. **Network issues**: Check if surf-forecast.com is accessible
4. **Timezone**: Verify TIMEZONE setting matches your location

### Logs
The system provides detailed logging for debugging:
- Surf check start/completion
- Data extraction results
- Condition evaluation
- Email sending status
- Any errors encountered

## Architecture

- `surfCheck.js` - Main surf check logic
- `cronJob.js` - Daily scheduling
- `testSurfCheck.js` - Manual testing
- Simple regex-based data extraction (more reliable than DOM parsing)
- Clean separation of concerns
- Comprehensive error handling
