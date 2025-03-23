import axios from 'axios';
import * as cheerio from 'cheerio';
import { SURF_FORECAST_URL } from '@/app/config/surfConditions';

/**
 * @typedef {Object} SurfConditions
 * @property {number} waveHeight - Wave height in feet
 * @property {string} windDirection - Wind direction (e.g., 'offshore', 'onshore')
 * @property {number} windSpeed - Wind speed in mph
 * @property {string} timestamp - ISO timestamp of the forecast
 */

/**
 * Scrapes surf conditions from the specified beach URL
 * @param {string} beachName - Name of the beach to check
 * @returns {Promise<SurfConditions>} - Object containing surf conditions
 */
export async function scrapeSurfConditions(beachName) {
  try {
    const url = `${SURF_FORECAST_URL}/forecasts/${beachName}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // TODO: Update these selectors based on actual surf-forecast.com HTML structure
    const waveHeight = parseFloat($('.wave-height').first().text()) || 0;
    const windDirection = $('.wind-direction').first().text().trim();
    const windSpeed = parseFloat($('.wind-speed').first().text()) || 0;

    return {
      waveHeight,
      windDirection,
      windSpeed,
      timestamp: new Date().toISOString(),
    };
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

  return isWaveHeightGood && isWindGood;
} 