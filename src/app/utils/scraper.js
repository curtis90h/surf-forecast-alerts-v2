import axios from 'axios';
import * as cheerio from 'cheerio';
import { SURF_CONDITIONS, SURF_FORECAST_URL, isWindDirectionFavorable } from '@/app/config/surfConditions';

/**
 * @typedef {Object} SurfConditions
 * @property {number} waveHeight - Wave height in meters
 * @property {number} wavePeriod - Wave period in seconds
 * @property {string} windDirection - Wind direction
 * @property {number} windSpeed - Wind speed in km/h
 * @property {number} temperature - Water temperature in Celsius
 * @property {string} timestamp - ISO timestamp of the forecast
 * @property {string} rating - Surf rating (e.g., "1 star", "2 stars")
 * @property {Object} detailedForecast - Detailed forecast data for the day
 */

/**
 * Scrapes surf conditions from the specified beach URL
 * @param {string} beachName - Name of the beach to check
 * @returns {Promise<SurfConditions>} - Object containing surf conditions
 */
export async function scrapeSurfConditions(beachName) {
  try {
    const url = `${SURF_FORECAST_URL}/breaks/${beachName}/forecasts/latest/six_day`;
    console.log('Fetching from URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    console.log('Page loaded successfully');

    // Get wave data from the first forecast cell
    const waveCell = $('.forecast-table tbody tr:first-child td:nth-child(3)');
    console.log('Wave cell found:', waveCell.length > 0);

    // Extract wave height (looking for the primary number in the cell)
    const waveText = waveCell.text().trim();
    console.log('Wave text:', waveText);
    const waveMatch = waveText.match(/(\d+\.?\d*)/);
    const waveHeight = waveMatch ? parseFloat(waveMatch[1]) : 0;

    // Extract wave direction
    const waveDirectionElement = waveCell.find('span[title]');
    const waveDirection = waveDirectionElement.attr('title')?.split(' ')[0] || 'N/A';

    // Extract wave period (looking for the number followed by 's')
    const periodMatch = waveText.match(/(\d+)s/);
    const wavePeriod = periodMatch ? parseFloat(periodMatch[1]) : 0;

    // Get wind data
    const windCell = $('.forecast-table tbody tr:first-child td:nth-child(4)');
    
    // Extract wind speed
    const windText = windCell.text().trim();
    const windMatch = windText.match(/(\d+)/);
    const windSpeed = windMatch ? parseFloat(windMatch[1]) : 0;

    // Extract wind direction
    const windDirElement = windCell.find('span[title]');
    const windDirection = windDirElement.attr('title')?.split(' ')[0] || 'N/A';

    // Get water temperature
    const tempText = $('div:contains("sea temperature is")').text();
    const tempMatch = tempText.match(/(\d+\.?\d*)°\s*C/);
    const temperature = tempMatch ? parseFloat(tempMatch[1]) : 0;

    // Get rating
    const ratingCell = $('.forecast-table tbody tr:first-child td:nth-child(2)');
    const ratingStars = ratingCell.find('img').length;
    const rating = ratingStars > 0 ? `${ratingStars} stars` : 'N/A';

    // Get detailed forecast for all days (3 time periods each)
    const detailedForecast = {
      today: {
        morning: null,
        afternoon: null,
        night: null
      },
      day2: {
        morning: null,
        afternoon: null,
        night: null
      },
      day3: {
        morning: null,
        afternoon: null,
        night: null
      },
      day4: {
        morning: null,
        afternoon: null,
        night: null
      },
      day5: {
        morning: null,
        afternoon: null,
        night: null
      },
      day6: {
        morning: null,
        afternoon: null,
        night: null
      },
      day7: {
        morning: null,
        afternoon: null,
        night: null
      }
    };

    // Find the period row using the data-row-name attribute
    const periodRow = $('.forecast-table__row[data-row-name="periods"]');
    console.log('Period row found:', periodRow.length > 0);

    // Get period values from the cells for all days
    const periodValues = [];
    if (periodRow.length > 0) {
      // Get period cells for all days (excluding the header)
      const periodCells = periodRow.find('.forecast-table__cell');
      console.log('Period cells found:', periodCells.length);
      
      periodCells.each((i, cell) => {
        const periodText = $(cell).find('strong').text().trim();
        console.log(`Period ${i + 1} text:`, periodText);
        periodValues.push(parseInt(periodText) || 0);
      });
    }
    console.log('Period values:', periodValues);

    // Get all wave height cells for all days
    const waveCells = $('.forecast-table-wave-height__cell');
    
    // Get today's date at midnight for consistent day calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Variables to store current conditions from first time period
    let currentWaveHeight = 0;
    let currentWavePeriod = 0;
    let currentWindSpeed = 0;
    let currentWindDirection = 'N/A';
    let currentWaveDirection = 'N/A';
    
    waveCells.each((index, cell) => {
      const $cell = $(cell);
      const dayIndex = Math.floor(index / 3);
      const dayKey = dayIndex === 0 ? 'today' : `day${dayIndex + 1}`;
      const timeOfDay = index % 3 === 0 ? 'morning' : index % 3 === 1 ? 'afternoon' : 'night';
      
      try {
        // Get the summary wave height from the displayed value
        const summaryHeight = parseFloat($cell.find('.swell-icon__val').text().trim()) || 0;
        const direction = $cell.find('.swell-icon__letters').text().trim();
        
        // Get wind data
        const windData = JSON.parse($cell.attr('data-wind') || '{}');

        // Calculate the date for this forecast period
        const forecastDate = new Date(today);
        forecastDate.setDate(today.getDate() + dayIndex);
        
        const formattedDate = forecastDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        // Store current conditions from the first time period
        if (index === 0) {
          currentWaveHeight = summaryHeight;
          currentWavePeriod = periodValues[0] || 0;
          currentWindSpeed = windData.speed || 0;
          currentWindDirection = windData.direction?.letters || 'N/A';
          currentWaveDirection = direction;
        }

        const timeData = {
          wave: {
            height: summaryHeight,
            direction: direction,
            period: periodValues[index] || 0
          },
          wind: {
            speed: windData.speed || 0,
            direction: windData.direction?.letters || 'N/A'
          },
          timestamp: forecastDate.toISOString(),
          formattedDate: formattedDate
        };

        // Check if conditions are favorable for this time period
        const { isGood, isPerfect } = areFavorableConditions({
          waveHeight: timeData.wave.height,
          wavePeriod: timeData.wave.period,
          waveDirection: timeData.wave.direction,
          windSpeed: timeData.wind.speed,
          windDirection: timeData.wind.direction
        }, SURF_CONDITIONS);

        timeData.isGood = isGood;
        timeData.isPerfect = isPerfect;

        detailedForecast[dayKey][timeOfDay] = timeData;
      } catch (error) {
        console.error(`Error parsing ${dayKey} ${timeOfDay} data:`, error);
      }
    });

    const conditions = {
      waveHeight: currentWaveHeight,
      wavePeriod: currentWavePeriod,
      waveDirection: currentWaveDirection,
      windDirection: currentWindDirection,
      windSpeed: currentWindSpeed,
      temperature,
      rating,
      timestamp: new Date().toISOString(),
      detailedForecast
    };

    console.log('Scraped conditions:', conditions);
    return conditions;

  } catch (error) {
    console.error('Error scraping surf conditions:', error);
    throw new Error(`Failed to scrape surf conditions for ${beachName}: ${error.message}`);
  }
}

/**
 * Checks if conditions meet the desired criteria
 * @param {Object} conditions - Wave and wind conditions
 * @param {Object} criteria - Desired conditions criteria
 * @param {number} windTolerance - Wind direction tolerance (2 for good, 1 for perfect)
 * @returns {boolean} - Whether conditions are favorable
 */
function checkFavorableConditions(conditions, criteria, windTolerance = 2) {
  console.log('Checking conditions:', conditions);
  console.log('Against criteria:', criteria);

  if (!conditions?.wave || !conditions?.wind || !criteria?.wave || !criteria?.waveHeight) {
    console.log('Missing required condition or criteria properties');
    return false;
  }

  // Check wave height
  const isWaveHeightGood = conditions.wave.height >= criteria.waveHeight.min && 
                          conditions.wave.height <= criteria.waveHeight.max;

  // Check wave direction
  const isWaveDirectionGood = Array.isArray(criteria.wave.preferredDirections) && 
                             conditions.wave.direction && 
                             criteria.wave.preferredDirections.includes(conditions.wave.direction);

  // Check wave period
  const isWavePeriodGood = conditions.wave.period >= criteria.wave.periodMin && 
                          conditions.wave.period <= criteria.wave.periodMax;

  // Check wind speed
  const isWindSpeedGood = conditions.wind.speed <= criteria.wind.maxSpeed;

  // Check wind direction relative to swell
  const isWindDirectionGood = isWindDirectionFavorable(conditions.wave.direction, conditions.wind.direction, windTolerance);

  // For debugging
  console.log('Condition checks:', {
    height: isWaveHeightGood,
    direction: isWaveDirectionGood,
    period: isWavePeriodGood,
    windSpeed: isWindSpeedGood,
    windDirection: isWindDirectionGood,
    waveHeight: conditions.wave.height,
    waveDirection: conditions.wave.direction,
    wavePeriod: conditions.wave.period,
    windSpeed: conditions.wind.speed,
    windDir: conditions.wind.direction
  });

  return isWaveHeightGood && isWaveDirectionGood && isWavePeriodGood && 
         isWindSpeedGood && isWindDirectionGood;
}

/**
 * Checks if current conditions meet the desired criteria
 * @param {SurfConditions} conditions - Current surf conditions
 * @param {Object} criteria - Desired surf conditions criteria
 * @returns {Object} - Whether conditions are good and/or perfect
 */
export function areFavorableConditions(conditions, criteria) {
  if (!conditions || !criteria) {
    console.log('Missing conditions or criteria');
    return { isGood: false, isPerfect: false };
  }

  const conditionsObj = {
    wave: {
      height: conditions.waveHeight,
      period: conditions.wavePeriod,
      direction: conditions.waveDirection
    },
    wind: {
      speed: conditions.windSpeed,
      direction: conditions.windDirection
    }
  };

  const isGood = checkFavorableConditions(conditionsObj, criteria.good, 2);
  const isPerfect = checkFavorableConditions(conditionsObj, criteria.perfect, 1);

  return { isGood, isPerfect };
} 