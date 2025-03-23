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
              <p className="font-medium">{SURF_CONDITIONS.waveHeight.min} - {SURF_CONDITIONS.waveHeight.max} ft</p>
            </div>
            <div>
              <p className="text-gray-600">Max Wind Speed</p>
              <p className="font-medium">{SURF_CONDITIONS.wind.maxSpeed} mph</p>
            </div>
            <div>
              <p className="text-gray-600">Preferred Wind Directions</p>
              <p className="font-medium">{SURF_CONDITIONS.wind.preferredDirections.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Current Conditions Card */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Current Conditions</h2>
            <button
              onClick={checkConditions}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Wave Height</p>
                <p className="font-medium">{conditions.conditions.waveHeight} ft</p>
              </div>
              <div>
                <p className="text-gray-600">Wind Direction</p>
                <p className="font-medium">{conditions.conditions.windDirection}</p>
              </div>
              <div>
                <p className="text-gray-600">Wind Speed</p>
                <p className="font-medium">{conditions.conditions.windSpeed} mph</p>
              </div>
              <div>
                <p className="text-gray-600">Conditions Status</p>
                <p className={`font-medium ${conditions.isFavorable ? 'text-green-600' : 'text-yellow-600'}`}>
                  {conditions.isFavorable ? '🏄‍♂️ Favorable' : 'Not Ideal'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 