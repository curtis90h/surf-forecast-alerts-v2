'use client';

import { useState, useEffect } from 'react';
import { SURF_CONDITIONS } from '@/app/config/surfConditions';

export default function Home() {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkConditions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/check-forecast');
      const data = await response.json();
      
      if (!data.success) throw new Error(data.error);
      setConditions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConditions();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">Surf Forecast Alert</h1>
        
        {/* Configuration Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Target Beach</p>
              <p className="font-medium">{SURF_CONDITIONS.beach}</p>
            </div>
            <div>
              <p className="text-gray-600">Wave Height Range</p>
              <p className="font-medium">{SURF_CONDITIONS.waveHeight.min} - {SURF_CONDITIONS.waveHeight.max} m</p>
            </div>
            <div>
              <p className="text-gray-600">Max Wind Speed</p>
              <p className="font-medium">{SURF_CONDITIONS.wind.maxSpeed} km/h</p>
            </div>
            <div>
              <p className="text-gray-600">Preferred Wind Directions</p>
              <p className="font-medium">{SURF_CONDITIONS.wind.preferredDirections.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Current Conditions Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Current Conditions</h2>
            <button
              onClick={checkConditions}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Checking...' : 'Check Now'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {conditions && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Wave Conditions</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Height: <span className="font-medium">{conditions.conditions.waveHeight} m</span></p>
                  <p className="text-gray-600">Period: <span className="font-medium">{conditions.conditions.wavePeriod} s</span></p>
                  <p className="text-gray-600">Rating: <span className="font-medium">{conditions.conditions.rating}</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Wind Conditions</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Speed: <span className="font-medium">{conditions.conditions.windSpeed} km/h</span></p>
                  <p className="text-gray-600">Direction: <span className="font-medium">{conditions.conditions.windDirection}</span></p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Other Conditions</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Water Temp: <span className="font-medium">{conditions.conditions.temperature}°C</span></p>
                  <p className="text-gray-600">Status: 
                    <span className={`font-medium ${conditions.isFavorable ? 'text-green-600' : 'text-yellow-600'} ml-2`}>
                      {conditions.isFavorable ? '🏄‍♂️ Favorable' : 'Not Ideal'}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm">Last Updated: 
                    <span className="font-medium ml-2">
                      {new Date(conditions.conditions.timestamp).toLocaleTimeString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 