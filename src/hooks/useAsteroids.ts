import { useQuery } from '@tanstack/react-query';
import { Asteroid, calculateRiskScore } from '@/lib/asteroidData';

const NASA_API_KEY = 'DEMO_KEY'; // Users should replace with their own key

interface NASANeoWsResponse {
  element_count: number;
  near_earth_objects: {
    [date: string]: Array<{
      id: string;
      name: string;
      nasa_jpl_url: string;
      absolute_magnitude_h: number;
      estimated_diameter: {
        kilometers: {
          estimated_diameter_min: number;
          estimated_diameter_max: number;
        };
      };
      is_potentially_hazardous_asteroid: boolean;
      close_approach_data: Array<{
        close_approach_date: string;
        relative_velocity: {
          kilometers_per_hour: string;
        };
        miss_distance: {
          kilometers: string;
        };
        orbiting_body: string;
      }>;
    }>;
  };
}

const fetchAsteroids = async (): Promise<Asteroid[]> => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const startDate = today.toISOString().split('T')[0];
  const endDate = nextWeek.toISOString().split('T')[0];

  const response = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch asteroid data');
  }

  const data: NASANeoWsResponse = await response.json();
  
  const asteroids: Asteroid[] = [];
  
  Object.entries(data.near_earth_objects).forEach(([date, neos]) => {
    neos.forEach((neo) => {
      const approach = neo.close_approach_data[0];
      const asteroid: Asteroid = {
        id: neo.id,
        name: neo.name,
        nasaId: neo.id,
        diameter: {
          min: neo.estimated_diameter.kilometers.estimated_diameter_min,
          max: neo.estimated_diameter.kilometers.estimated_diameter_max,
          unit: 'km',
        },
        velocity: parseFloat(approach.relative_velocity.kilometers_per_hour),
        missDistance: parseFloat(approach.miss_distance.kilometers),
        isHazardous: neo.is_potentially_hazardous_asteroid,
        closeApproachDate: approach.close_approach_date,
        orbitingBody: approach.orbiting_body,
        riskScore: 0,
        absoluteMagnitude: neo.absolute_magnitude_h,
      };
      
      asteroid.riskScore = calculateRiskScore(asteroid);
      asteroids.push(asteroid);
    });
  });

  // Sort by risk score (highest first)
  return asteroids.sort((a, b) => b.riskScore - a.riskScore);
};

export function useAsteroids() {
  return useQuery({
    queryKey: ['asteroids'],
    queryFn: fetchAsteroids,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
}

export function useWatchlist() {
  // This would be connected to Supabase when Cloud is enabled
  const watchedIds = new Set<string>();
  
  const addToWatchlist = (id: string) => {
    watchedIds.add(id);
  };
  
  const removeFromWatchlist = (id: string) => {
    watchedIds.delete(id);
  };
  
  const isWatched = (id: string) => watchedIds.has(id);
  
  return { watchedIds, addToWatchlist, removeFromWatchlist, isWatched };
}
