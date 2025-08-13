require('dotenv').config({ path: '.env.local' });
const axios = require("axios");
const nodemailer = require("nodemailer");

// Surf condition criteria
const SURF_CRITERIA = {
  good: {
    waveHeight: { min: 1, max: 2 },
    wavePeriod: { min: 12, max: 21 },
    preferredDirections: ["S", "SSW", "SW", "WSW", "W"],
    maxWindSpeed: 20
  },
  perfect: {
    waveHeight: { min: 1, max: 1.5 },
    wavePeriod: { min: 15, max: 21 },
    preferredDirections: ["S", "SSW", "SW"],
    maxWindSpeed: 10
  }
};

// Compass directions for wind calculations
const COMPASS_DIRECTIONS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
];

/**
 * Get opposing wind directions (offshore) for a given wave direction
 */
function getOffshoreWindDirections(waveDirection, tolerance = 2) {
  const waveIndex = COMPASS_DIRECTIONS.indexOf(waveDirection);
  if (waveIndex === -1) return [];
  
  const oppositeIndex = (waveIndex + 8) % 16;
  const validWindDirections = [];
  
  for (let i = -tolerance; i <= tolerance; i++) {
    const windIndex = (oppositeIndex + i + 16) % 16;
    validWindDirections.push(COMPASS_DIRECTIONS[windIndex]);
  }
  
  return validWindDirections;
}

/**
 * Check if conditions meet good or perfect criteria
 */
function evaluateConditions(waveHeight, wavePeriod, waveDirection, windSpeed, windDirection) {
  // Check good conditions
  const isGoodHeight = waveHeight >= SURF_CRITERIA.good.waveHeight.min && 
                      waveHeight <= SURF_CRITERIA.good.waveHeight.max;
  const isGoodPeriod = wavePeriod >= SURF_CRITERIA.good.wavePeriod.min && 
                       wavePeriod <= SURF_CRITERIA.good.wavePeriod.max;
  const isGoodDirection = SURF_CRITERIA.good.preferredDirections.includes(waveDirection);
  const isGoodWindSpeed = windSpeed <= SURF_CRITERIA.good.maxWindSpeed;
  
  // For good conditions, wind direction is flexible if speed is low
  let isGoodWindDirection = false;
  if (windSpeed <= 10) {
    isGoodWindDirection = true; // Any wind direction OK if speed ≤10km/h
  } else {
    const goodWindDirections = getOffshoreWindDirections(waveDirection, 3);
    isGoodWindDirection = goodWindDirections.includes(windDirection);
  }
  
  const isGood = isGoodHeight && isGoodPeriod && isGoodDirection && 
                 isGoodWindSpeed && isGoodWindDirection;
  
  // Check perfect conditions
  const isPerfectHeight = waveHeight >= SURF_CRITERIA.perfect.waveHeight.min && 
                         waveHeight <= SURF_CRITERIA.perfect.waveHeight.max;
  const isPerfectPeriod = wavePeriod >= SURF_CRITERIA.perfect.wavePeriod.min && 
                          wavePeriod <= SURF_CRITERIA.perfect.wavePeriod.max;
  const isPerfectDirection = SURF_CRITERIA.perfect.preferredDirections.includes(waveDirection);
  const isPerfectWindSpeed = windSpeed <= SURF_CRITERIA.perfect.maxWindSpeed;
  const perfectWindDirections = getOffshoreWindDirections(waveDirection, 2);
  const isPerfectWindDirection = perfectWindDirections.includes(windDirection);
  
  const isPerfect = isPerfectHeight && isPerfectPeriod && isPerfectDirection && 
                    isPerfectWindSpeed && isPerfectWindDirection;
  
  return { isGood, isPerfect };
}

/**
 * Scrape surf conditions from the forecast website
 */
async function scrapeSurfConditions(beach) {
  try {
    const url = `${process.env.SURF_FORECAST_URL}/breaks/${beach}/forecasts/latest/six_day`;
    console.log(`Fetching surf conditions from: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      },
      timeout: 30000
    });
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = response.data;
    
    // Extract all swell state data (42 entries: 7 days × 3 time periods × 2 data types)
    const swellMatches = html.match(/data-swell-state="([^"]+)"/g);
    const windMatches = html.match(/data-wind="([^"]+)"/g);
    
    if (!swellMatches || !windMatches || swellMatches.length < 21 || windMatches.length < 21) {
      throw new Error("Could not extract required forecast data from the page");
    }
    
    console.log(`Extracted ${swellMatches.length} swell entries and ${windMatches.length} wind entries`);
    
    // Parse all the data
    const forecastData = [];
    const timePeriods = ['morning', 'afternoon', 'evening'];
    
    // Process 7 days × 3 time periods = 21 entries
    for (let day = 0; day < 7; day++) {
      const dayData = {
        date: (() => {
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(0, 0, 0, 0);
          return date;
        })(),
        
        morning: null,
        afternoon: null,
        evening: null
      };
      
      for (let time = 0; time < 3; time++) {
        const index = day * 3 + time;
        if (index < swellMatches.length && index < windMatches.length) {
          try {
            // Parse swell data
            const swellState = JSON.parse(swellMatches[index].replace(/data-swell-state="([^"]+)"/, '$1').replace(/&quot;/g, '"'));
            const windData = JSON.parse(windMatches[index].replace(/data-wind="([^"]+)"/, '$1').replace(/&quot;/g, '"'));
            
            // Get the primary swell (highest height)
            const primarySwell = swellState.reduce((max, swell) => 
              swell && swell.height > max.height ? swell : max, 
              { height: 0, period: 0, letters: 'N/A' }
            );
            
            const conditions = {
              waveHeight: primarySwell.height,
              wavePeriod: primarySwell.period,
              waveDirection: primarySwell.letters,
              windSpeed: windData.speed || 0,
              windDirection: windData.direction?.letters || "N/A",
              timestamp: new Date().toISOString()
            };
            
            // Evaluate conditions for this time period
            const { isGood, isPerfect } = evaluateConditions(
              conditions.waveHeight,
              conditions.wavePeriod,
              conditions.waveDirection,
              conditions.windSpeed,
              conditions.windDirection
            );
            
            conditions.isGood = isGood;
            conditions.isPerfect = isPerfect;
            
            dayData[timePeriods[time]] = conditions;
            
          } catch (e) {
            console.error(`Error parsing data for day ${day + 1}, ${timePeriods[time]}:`, e.message);
          }
        }
      }
      
      forecastData.push(dayData);
    }
    
    // Get current conditions (first entry - today's morning)
    const currentConditions = forecastData[0].morning || forecastData[0].afternoon || forecastData[0].evening;
    
    console.log(`Extracted full 7-day forecast with current conditions: ${currentConditions.waveHeight}m ${currentConditions.waveDirection} @ ${currentConditions.wavePeriod}s`);
    
    return {
      currentConditions,
      forecastData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error("Error scraping surf conditions:", error.message);
    throw error;
  }
}

/**
 * Send email notification for good surf conditions
 */
async function sendEmailAlert(conditions, beach) {
  try {
    console.log("Preparing to send email alert...");
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    const { isGood, isPerfect } = conditions;
    const conditionType = isPerfect ? "PERFECT" : "GOOD";
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "curtis90h@gmail.com",
      subject: `Surf Alert: ${conditionType} conditions at ${beach}!`,
      html: `
        <h2>🏄‍♂️ Surf Alert!</h2>
        <p><strong>${conditionType}</strong> surf conditions detected at <strong>${beach}</strong>! 🌊</p>
        
        <h3>Current Conditions:</h3>
        <ul>
          <li><strong>Wave Height:</strong> ${conditions.waveHeight}m</li>
          <li><strong>Wave Direction:</strong> ${conditions.waveDirection}</li>
          <li><strong>Wave Period:</strong> ${conditions.wavePeriod}s</li>
          <li><strong>Wind Speed:</strong> ${conditions.windSpeed}km/h</li>
          <li><strong>Wind Direction:</strong> ${conditions.windDirection}</li>
        </ul>
        
        <p><em>Check time: ${new Date().toLocaleString()}</em></p>
        
        <p>Time to grab your board and hit the waves! 🏄‍♀️</p>
      `,
      text: `
        Surf Alert! ${conditionType} conditions at ${beach}!
        
        Current Conditions:
        - Wave Height: ${conditions.waveHeight}m
        - Wave Direction: ${conditions.waveDirection}
        - Wave Period: ${conditions.wavePeriod}s
        - Wind Speed: ${conditions.windSpeed}km/h
        - Wind Direction: ${conditions.windDirection}
        
        Check time: ${new Date().toLocaleString()}
        
        Time to grab your board and hit the waves!
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email alert sent successfully:", info.messageId);
    return true;
    
  } catch (error) {
    console.error("Error sending email alert:", error.message);
    throw error;
  }
}

/**
 * Main surf check function
 */
async function checkSurfConditions() {
  try {
    console.log("Starting daily surf check...");
    
    // Validate environment variables
    const requiredEnvVars = [
      'SURF_FORECAST_URL',
      'TARGET_BEACH',
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_USER',
      'SMTP_PASS'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
    
    const beach = process.env.TARGET_BEACH;
    console.log(`Checking conditions for beach: ${beach}`);
    
    // Scrape current conditions
    const conditions = await scrapeSurfConditions(beach);
    
    // Evaluate conditions
    const { isGood, isPerfect } = evaluateConditions(
      conditions.currentConditions.waveHeight,
      conditions.currentConditions.wavePeriod,
      conditions.currentConditions.waveDirection,
      conditions.currentConditions.windSpeed,
      conditions.currentConditions.windDirection
    );
    
    console.log(`Conditions evaluation: Good=${isGood}, Perfect=${isPerfect}`);
    
    // Send email if conditions are met
    if (isGood || isPerfect) {
      console.log("Good conditions detected! Sending email alert...");
      await sendEmailAlert({ ...conditions.currentConditions, isGood, isPerfect }, beach);
      console.log("Surf check completed successfully - email sent");
    } else {
      console.log("No good conditions detected. Surf check completed.");
    }
    
    return { 
      success: true, 
      conditions: { ...conditions.currentConditions, isGood, isPerfect },
      forecastData: conditions.forecastData
    };
    
  } catch (error) {
    console.error("Error in surf check:", error.message);
    throw error;
  }
}

// Export for use in other modules
module.exports = {
  checkSurfConditions,
  evaluateConditions,
  scrapeSurfConditions,
  sendEmailAlert
};

// If running directly (for cron jobs), execute the check
if (require.main === module) {
  checkSurfConditions()
    .then(result => {
      console.log("Surf check completed:", result);
      process.exit(0);
    })
    .catch(error => {
      console.error("Surf check failed:", error.message);
      process.exit(1);
    });
}
