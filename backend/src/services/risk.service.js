/**
 * Calculate Risk Score (0-100)
 * Factors:
 * - Is Hazardous (Weight: 40)
 * - Miss Distance (Weight: 30) - Closer = Higher Risk
 * - Diameter (Weight: 20) - Larger = Higher Risk
 * - Velocity (Weight: 10) - Faster = Higher Risk
 */
const calculateRiskScore = (asteroid) => {
  let score = 0;

  // 1. Hazardous Flag (Max 40)
  if (asteroid.is_potentially_hazardous_asteroid) {
    score += 40;
  }

  // 2. Miss Distance (Max 30)
  // Reference: Moon distance ~384,400 km. 
  // Let's say < 1M km is very high risk (30 pts), > 70M km is low risk (0 pts).
  const missDistanceKm = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
  if (missDistanceKm < 1000000) score += 30;
  else if (missDistanceKm < 5000000) score += 20;
  else if (missDistanceKm < 10000000) score += 10;
  else if (missDistanceKm < 30000000) score += 5;

  // 3. Diameter (Max 20)
  // Max diameter in km
  const diameter = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
  if (diameter > 1.0) score += 20; // > 1km is civilization ending
  else if (diameter > 0.5) score += 15;
  else if (diameter > 0.1) score += 10;
  else if (diameter > 0.05) score += 5;

  // 4. Velocity (Max 10)
  // Relative velocity km/h
  const velocity = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour);
  if (velocity > 100000) score += 10;
  else if (velocity > 70000) score += 7;
  else if (velocity > 40000) score += 4;

  return Math.min(score, 100);
};

module.exports = {
  calculateRiskScore,
};
