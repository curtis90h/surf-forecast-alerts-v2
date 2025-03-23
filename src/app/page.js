'use client';

import { useState, useEffect } from 'react';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

export default function Home() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGoodCriteria, setShowGoodCriteria] = useState(false);
  const [showPerfectCriteria, setShowPerfectCriteria] = useState(false);

  const checkConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/check-forecast');
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error);
        return; // Keep existing conditions by just returning here
      }

      console.log('Received data:', data);
      console.log('Detailed forecast:', data.conditions.detailedForecast);
      setConditions(data);
    } catch (err) {
      console.error('Error checking conditions:', err);
      setError(err.message);
      // Keep existing conditions by not clearing them
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConditions();
  }, []);

  if (!conditions && !error && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <p>Loading surf conditions...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              Surf Forecast
              <span className="block text-lg font-normal text-blue-600 mt-1">
                {SURF_CONDITIONS.beach}
              </span>
            </h1>
            <div className="flex flex-col items-end gap-2">
              <div className="flex justify-end">
                <button
                  onClick={checkConditions}
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Refreshing...</span>
                    </div>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600 text-right">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {conditions && (
          <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {/* Current Conditions Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">Current Conditions</h2>
              </div>
              <div className="px-6 py-5">
                <div className={`rounded-xl p-6 ${
                  conditions.conditions.isPerfect ? 'bg-green-50/80 ring-2 ring-green-500/20' : 
                  conditions.conditions.isGood ? 'bg-blue-50/80 ring-2 ring-blue-500/20' : 
                  'bg-gray-50/80'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Conditions</h3>
                    {conditions.conditions.isPerfect && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        🏄‍♂️ Perfect
                      </span>
                    )}
                    {!conditions.conditions.isPerfect && conditions.conditions.isGood && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        🌊 Good
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Wave Height</p>
                      <p className="text-lg font-medium text-gray-900">{conditions.conditions.waveHeight} m</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wave Period</p>
                      <p className="text-lg font-medium text-gray-900">{conditions.conditions.wavePeriod} s</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wave Direction</p>
                      <p className="text-lg font-medium text-gray-900">{conditions.conditions.waveDirection}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wind Speed</p>
                      <p className="text-lg font-medium text-gray-900">{conditions.conditions.windSpeed} km/h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Wind Direction</p>
                      <p className="text-lg font-medium text-gray-900">{conditions.conditions.windDirection}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Forecast Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mt-12">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900">7-Day Detailed Forecast</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      {Object.entries(conditions.conditions.detailedForecast).map(([dayKey, dayData], index) => (
                        dayData.morning && (
                          <th key={dayKey} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {dayData.morning.formattedDate}
                          </th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Morning Row */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Morning</td>
                      {Object.entries(conditions.conditions.detailedForecast).map(([dayKey, dayData]) => (
                        dayData.morning && (
                          <td key={`${dayKey}-morning`} className={`px-6 py-4 whitespace-nowrap text-sm ${
                            dayData.morning.isPerfect ? 'bg-green-50' : 
                            dayData.morning.isGood ? 'bg-blue-50' : ''
                          }`}>
                            <div className="space-y-1">
                              <div className="font-medium">{dayData.morning.wave.height}m {dayData.morning.wave.direction}</div>
                              <div className="text-gray-500">{dayData.morning.wave.period}s</div>
                              <div className="text-gray-500">{dayData.morning.wind.speed}km/h {dayData.morning.wind.direction}</div>
                            </div>
                          </td>
                        )
                      ))}
                    </tr>
                    {/* Afternoon Row */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Afternoon</td>
                      {Object.entries(conditions.conditions.detailedForecast).map(([dayKey, dayData]) => (
                        dayData.afternoon && (
                          <td key={`${dayKey}-afternoon`} className={`px-6 py-4 whitespace-nowrap text-sm ${
                            dayData.afternoon.isPerfect ? 'bg-green-50' : 
                            dayData.afternoon.isGood ? 'bg-blue-50' : ''
                          }`}>
                            <div className="space-y-1">
                              <div className="font-medium">{dayData.afternoon.wave.height}m {dayData.afternoon.wave.direction}</div>
                              <div className="text-gray-500">{dayData.afternoon.wave.period}s</div>
                              <div className="text-gray-500">{dayData.afternoon.wind.speed}km/h {dayData.afternoon.wind.direction}</div>
                            </div>
                          </td>
                        )
                      ))}
                    </tr>
                    {/* Night Row */}
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Night</td>
                      {Object.entries(conditions.conditions.detailedForecast).map(([dayKey, dayData]) => (
                        dayData.night && (
                          <td key={`${dayKey}-night`} className={`px-6 py-4 whitespace-nowrap text-sm ${
                            dayData.night.isPerfect ? 'bg-green-50' : 
                            dayData.night.isGood ? 'bg-blue-50' : ''
                          }`}>
                            <div className="space-y-1">
                              <div className="font-medium">{dayData.night.wave.height}m {dayData.night.wave.direction}</div>
                              <div className="text-gray-500">{dayData.night.wave.period}s</div>
                              <div className="text-gray-500">{dayData.night.wind.speed}km/h {dayData.night.wind.direction}</div>
                            </div>
                          </td>
                        )
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Criteria Cards */}
            <div className="mt-12 mb-12 space-y-8">
              {/* Good Conditions Criteria */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                <button 
                  onClick={() => setShowGoodCriteria(!showGoodCriteria)}
                  className="w-full px-6 py-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center"
                >
                  <h2 className="text-xl font-semibold text-blue-900">Good Conditions</h2>
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${showGoodCriteria ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showGoodCriteria && (
                  <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Wave Height</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.good.waveHeight.min} - {SURF_CONDITIONS.good.waveHeight.max} m
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wave Period</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.good.wave.periodMin} - {SURF_CONDITIONS.good.wave.periodMax} s
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wave Direction</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.good.wave.preferredDirections.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wind Speed</p>
                        <p className="text-base font-medium text-gray-900">
                          Up to {SURF_CONDITIONS.good.wind.maxSpeed} km/h
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wind Direction</p>
                        <p className="text-base font-medium text-gray-900">
                          Offshore to Cross-Shore (±2 directions)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Perfect Conditions Criteria */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mt-8">
                <button 
                  onClick={() => setShowPerfectCriteria(!showPerfectCriteria)}
                  className="w-full px-6 py-4 bg-green-50 border-b border-green-100 flex justify-between items-center"
                >
                  <h2 className="text-xl font-semibold text-green-900">Perfect Conditions</h2>
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${showPerfectCriteria ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPerfectCriteria && (
                  <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Wave Height</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.perfect.waveHeight.min} - {SURF_CONDITIONS.perfect.waveHeight.max} m
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wave Period</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.perfect.wave.periodMin} - {SURF_CONDITIONS.perfect.wave.periodMax} s
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wave Direction</p>
                        <p className="text-base font-medium text-gray-900">
                          {SURF_CONDITIONS.perfect.wave.preferredDirections.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wind Speed</p>
                        <p className="text-base font-medium text-gray-900">
                          Up to {SURF_CONDITIONS.perfect.wind.maxSpeed} km/h
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Wind Direction</p>
                        <p className="text-base font-medium text-gray-900">
                          Offshore (±1 direction)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {loading && !conditions && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
    </main>
  );
} 