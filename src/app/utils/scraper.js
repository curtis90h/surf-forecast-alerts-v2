import axios from 'axios';
import * as cheerio from 'cheerio';
import { SURF_FORECAST_URL } from '@/app/config/surfConditions';

/**
 * @typedef {Object} SurfConditions
 * @property {number} waveHeight - Wave height in meters
 * @property {number} wavePeriod - Wave period in seconds
 * @property {string} windDirection - Wind direction
 * @property {number} windSpeed - Wind speed in km/h
 * @property {number} temperature - Water temperature in Celsius
 * @property {string} timestamp - ISO timestamp of the forecast
 * @property {string} rating - Surf rating (e.g., "1 star", "2 stars")
 */

/**
 * Scrapes surf conditions from the specified beach URL
 * @param {string} beachName - Name of the beach to check
 * @returns {Promise<SurfConditions>} - Object containing surf conditions
 */
export async function scrapeSurfConditions(beachName) {
  try {
    // Format beach name for URL (e.g., "Long-Beach_6")
    const url = `${SURF_FORECAST_URL}/breaks/${beachName}/forecasts/latest/six_day`;
    console.log('Fetching from URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    console.log('Page loaded successfully');

    // Get wave data from the first time slot
    const firstTimeSlot = $('tr.forecast-table__row').first();
    console.log('First time slot found:', firstTimeSlot.length > 0);

    // Get wave height and period
    const waveText = firstTimeSlot.find('.forecast-table__value--significant').text().trim();
    console.log('Wave text:', waveText);
    const waveHeight = parseFloat(waveText) || 0;

    const periodText = firstTimeSlot.find('.forecast-table__cell--wave .forecast-table__value-unit').text().trim();
    console.log('Period text:', periodText);
    const wavePeriod = parseFloat(periodText) || 0;

    // Get wind data
    const windText = firstTimeSlot.find('.forecast-table__cell--wind .forecast-table__value').text().trim();
    console.log('Wind text:', windText);
    const windSpeed = parseFloat(windText) || 0;

    const windDirection = firstTimeSlot.find('.forecast-table__wind-direction').attr('title') || 'N/A';
    console.log('Wind direction:', windDirection);

    // Get water temperature
    const tempText = $('div:contains("sea temperature is")').text();
    console.log('Temperature text:', tempText);
    const tempMatch = tempText.match(/(\d+\.?\d*)°\s*C/);
    const temperature = tempMatch ? parseFloat(tempMatch[1]) : 0;

    // Get rating
    const ratingImg = firstTimeSlot.find('.forecast-table__star-rating img').attr('title');
    console.log('Rating:', ratingImg);
    const rating = ratingImg || 'N/A';

    const conditions = {
      waveHeight,
      wavePeriod,
      windDirection,
      windSpeed,
      temperature,
      rating,
      timestamp: new Date().toISOString(),
    };

    console.log('Scraped conditions:', conditions);
    return conditions;

  } catch (error) {
    console.error('Error scraping surf conditions:', error);
    throw new Error(`Failed to scrape surf conditions for ${beachName}: ${error.message}`);
  }
}

/**
 * Checks if current conditions meet the desired criteria
 * @param {SurfConditions} conditions - Current surf conditions
 * @param {Object} criteria - Desired surf conditions criteria
 * @returns {boolean} - Whether conditions are favorable
 */
export function areFavorableConditions(conditions, criteria) {
  const isWaveHeightGood = conditions.waveHeight >= criteria.waveHeight.min && 
                          conditions.waveHeight <= criteria.waveHeight.max;
  
  const isWindGood = conditions.windSpeed <= criteria.wind.maxSpeed &&
                    criteria.wind.preferredDirections.includes(conditions.windDirection.toLowerCase());

  const isWavePeriodGood = conditions.wavePeriod >= 8; // Generally, periods above 8s are considered good

  return isWaveHeightGood && isWindGood && isWavePeriodGood;
} 