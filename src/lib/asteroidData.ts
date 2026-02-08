export interface Asteroid {
  id: string;
  name: string;
  nasaId: string;
  diameter: {
    min: number;
    max: number;
    unit: string;
  };
  velocity: number;
  missDistance: number;
  isHazardous: boolean;
  closeApproachDate: string;
  orbitingBody: string;
  riskScore: number;
  absoluteMagnitude: number;
}

export interface NASAAsteroid {
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
}

export const calculateRiskScore = (asteroid: {
  isHazardous: boolean;
  missDistance: number;
  diameter: { max: number };
}): number => {
  let score = 0;
  
  // Base score for hazardous classification
  if (asteroid.isHazardous) score += 40;
  
  // Distance scoring (closer = higher risk)
  const distanceInLunar = asteroid.missDistance / 384400; // km to lunar distances
  if (distanceInLunar < 1) score += 30;
  else if (distanceInLunar < 5) score += 20;
  else if (distanceInLunar < 10) score += 10;
  
  // Size scoring (larger = higher risk)
  if (asteroid.diameter.max > 1) score += 30;
  else if (asteroid.diameter.max > 0.5) score += 20;
  else if (asteroid.diameter.max > 0.1) score += 10;
  
  return Math.min(score, 100);
};

export const getRiskLevel = (score: number): { label: string; color: string } => {
  if (score >= 70) return { label: 'Critical', color: 'destructive' };
  if (score >= 50) return { label: 'High', color: 'warning' };
  if (score >= 30) return { label: 'Moderate', color: 'accent' };
  return { label: 'Low', color: 'success' };
};

export const formatDistance = (km: number): string => {
  if (km >= 1000000) {
    return `${(km / 1000000).toFixed(2)}M km`;
  }
  return `${km.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} km`;
};

export const formatVelocity = (kmh: number): string => {
  return `${kmh.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} km/h`;
};

// Mock data for initial display
export const mockAsteroids: Asteroid[] = [
  {
    id: '1',
    name: '(2024 AA)',
    nasaId: '54321001',
    diameter: { min: 0.15, max: 0.34, unit: 'km' },
    velocity: 45678,
    missDistance: 1234567,
    isHazardous: true,
    closeApproachDate: '2024-02-15',
    orbitingBody: 'Earth',
    riskScore: 72,
    absoluteMagnitude: 22.1,
  },
  {
    id: '2',
    name: '(2024 BB)',
    nasaId: '54321002',
    diameter: { min: 0.05, max: 0.12, unit: 'km' },
    velocity: 32100,
    missDistance: 5678900,
    isHazardous: false,
    closeApproachDate: '2024-02-16',
    orbitingBody: 'Earth',
    riskScore: 28,
    absoluteMagnitude: 24.5,
  },
  {
    id: '3',
    name: '(2024 CC)',
    nasaId: '54321003',
    diameter: { min: 0.45, max: 1.02, unit: 'km' },
    velocity: 67890,
    missDistance: 890123,
    isHazardous: true,
    closeApproachDate: '2024-02-17',
    orbitingBody: 'Earth',
    riskScore: 85,
    absoluteMagnitude: 19.8,
  },
  {
    id: '4',
    name: '(2024 DD)',
    nasaId: '54321004',
    diameter: { min: 0.02, max: 0.05, unit: 'km' },
    velocity: 28500,
    missDistance: 12345678,
    isHazardous: false,
    closeApproachDate: '2024-02-18',
    orbitingBody: 'Earth',
    riskScore: 12,
    absoluteMagnitude: 26.2,
  },
  {
    id: '5',
    name: '(2024 EE)',
    nasaId: '54321005',
    diameter: { min: 0.22, max: 0.48, unit: 'km' },
    velocity: 54321,
    missDistance: 2345678,
    isHazardous: true,
    closeApproachDate: '2024-02-19',
    orbitingBody: 'Earth',
    riskScore: 58,
    absoluteMagnitude: 21.3,
  },
];
