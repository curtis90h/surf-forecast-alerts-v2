const COMPASS_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

/**
 * Convert Surf-Forecast's SVG arrow rotation to the meteorological wind
 * direction (the direction the wind is coming from).
 *
 * The arrow points where the wind is blowing, which is 180 degrees opposite
 * the compass label shown by Surf-Forecast.
 */
function windArrowAngleToDirection(angle) {
  const sourceAngle = angle + 180;
  const normalized = (sourceAngle % 360 + 360) % 360;
  const index = Math.round(normalized / 22.5) % COMPASS_DIRECTIONS.length;
  return COMPASS_DIRECTIONS[index];
}

module.exports = { windArrowAngleToDirection };
