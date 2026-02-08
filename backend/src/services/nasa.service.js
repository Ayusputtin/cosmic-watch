const axios = require('axios');
const nasaConfig = require('../config/nasa.config');
const Asteroid = require('../models/Asteroid.model');
const { calculateRiskScore } = require('./risk.service');
const logger = require('../utils/logger');

const fetchAndCacheAsteroids = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `${nasaConfig.baseUrl}/feed?start_date=${today}&end_date=${today}&api_key=${nasaConfig.apiKey}`;
    
    logger.info(`Fetching NEO data from NASA: ${url}`);
    const response = await axios.get(url);
    const neos = response.data.near_earth_objects[today];

    if (!neos) return [];

    const processedAsteroids = [];

    for (const neo of neos) {
      const closeApproach = neo.close_approach_data[0];
      const riskScore = calculateRiskScore(neo);

      const asteroidData = {
        nasaId: neo.id,
        name: neo.name,
        diameterMin: neo.estimated_diameter.kilometers.estimated_diameter_min,
        diameterMax: neo.estimated_diameter.kilometers.estimated_diameter_max,
        velocity: parseFloat(closeApproach.relative_velocity.kilometers_per_hour),
        missDistance: parseFloat(closeApproach.miss_distance.kilometers),
        closeApproachDate: new Date(closeApproach.close_approach_date_full),
        isHazardous: neo.is_potentially_hazardous_asteroid,
        riskScore: riskScore,
        lastUpdated: new Date(),
      };

      // Upsert into DB
      const saved = await Asteroid.findOneAndUpdate(
        { nasaId: neo.id },
        asteroidData,
        { upsert: true, new: true }
      );
      processedAsteroids.push(saved);
    }

    logger.info(`Processed ${processedAsteroids.length} asteroids.`);
    return processedAsteroids;

  } catch (error) {
    logger.error(`Error fetching NASA data: ${error.message}`);
    throw error;
  }
};

module.exports = {
  fetchAndCacheAsteroids,
};
