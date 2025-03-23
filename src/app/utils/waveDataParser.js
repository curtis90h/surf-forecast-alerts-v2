/**
 * Extracts wave height data from a forecast table cell
 * @param {Element} cell - The table cell containing wave data
 * @returns {Object} Parsed wave data including height, direction, and period
 */
export function parseWaveData(cell) {
  try {
    // Extract the swell state data from the data attribute
    const swellStateStr = cell.dataset.swellState;
    const swellState = JSON.parse(swellStateStr);
    
    // Get wind data
    const windDataStr = cell.dataset.wind;
    const windData = JSON.parse(windDataStr);
    
    // Find the primary swell (usually the one shown in the swell icon)
    const primarySwell = swellState.reduce((highest, swell) => {
      if (!swell) return highest;
      return (!highest || swell.height > highest.height) ? swell : highest;
    }, null);

    // Get all swells for completeness
    const allSwells = swellState
      .filter(swell => swell !== null)
      .map(swell => ({
        height: swell.height,
        direction: swell.letters,
        period: swell.period
      }));

    return {
      primary: primarySwell ? {
        height: primarySwell.height,
        direction: primarySwell.letters,
        period: primarySwell.period
      } : null,
      allSwells,
      wind: {
        speed: windData.speed,
        direction: windData.direction.letters
      },
      timestamp: cell.dataset.date
    };
  } catch (error) {
    console.error('Error parsing wave data:', error);
    return null;
  }
}

/**
 * Extracts wave data for a specific day
 * @param {string} html - The HTML string containing the forecast table
 * @returns {Object} Wave data for morning, afternoon, and night
 */
export function getDayWaveData(html) {
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = html;
  
  // Get all wave height cells for the first day
  const waveCells = container.querySelectorAll('.forecast-table-wave-height__cell');
  
  // Extract data for each time period
  const waveData = {
    morning: null,
    afternoon: null,
    night: null
  };

  // Process the first three cells (AM, PM, Night)
  if (waveCells.length >= 3) {
    waveData.morning = parseWaveData(waveCells[0]);
    waveData.afternoon = parseWaveData(waveCells[1]);
    waveData.night = parseWaveData(waveCells[2]);
  }

  // Add debug logging
  console.log('Wave cells found:', waveCells.length);
  console.log('First cell data:', waveCells[0]?.dataset);
  console.log('Parsed wave data:', waveData);

  return waveData;
} 