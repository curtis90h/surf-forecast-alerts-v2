import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function RefreshButton({ onRefresh }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleRefresh = async () => {
    if (cooldown > 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/check-forecast');
      const data = await response.json();
      
      if (response.status === 429) {
        setCooldown(data.cooldownRemaining);
        // Start countdown
        const timer = setInterval(() => {
          setCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 60000); // Update every minute
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh');
      } else {
        onRefresh?.(data);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading || cooldown > 0}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        disabled:opacity-50 disabled:pointer-events-none ring-offset-background
        hover:bg-accent hover:text-accent-foreground 
        h-10 px-4 py-2 ${isLoading ? 'animate-pulse' : ''}`}
      title={cooldown > 0 ? `Wait ${cooldown} minutes` : 'Refresh conditions'}
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {cooldown > 0 && <span className="ml-2">{cooldown}m</span>}
    </button>
  );
} 