/**
 * Calculates transportation cost based on distance, cargo weight, and freight classification
 */
const calculateCost = ({ distanceKm, weightTons, cargoType = 'General Goods', taxRate = 18 }) => {
  const km = Math.max(1, Number(distanceKm) || 0);
  const tons = Math.max(0.1, Number(weightTons) || 0);

  // Multipliers by cargo classification
  const multipliers = {
    'General Goods': 1.0,
    'FMCG': 1.05,
    'Automotive': 1.15,
    'Machinery & Steel': 1.25,
    'Electronics': 1.2,
    'Perishable / Frozen': 1.35,
    'Chemicals': 1.3,
    'Hazardous Materials': 1.45,
  };

  const typeFactor = multipliers[cargoType] || 1.0;
  
  // Base rates: $2.20 / km (or ₹35 / km)
  const baseRatePerKm = 2.2;
  
  // Weight factor: scale with tonnage
  const weightFactor = 1 + (tons * 0.08);

  // Freight base price calculation
  const rawBase = km * baseRatePerKm * typeFactor * weightFactor;
  const basePrice = Math.round(rawBase * 100) / 100;

  // Taxes
  const taxAmount = Math.round((basePrice * (taxRate / 100)) * 100) / 100;
  const totalAmount = Math.round((basePrice + taxAmount) * 100) / 100;

  return {
    basePrice,
    taxRate,
    taxAmount,
    totalAmount,
    breakdown: {
      distanceKm: km,
      weightTons: tons,
      cargoType,
      typeMultiplier: typeFactor,
      effectiveRatePerKm: Math.round((basePrice / km) * 100) / 100,
    },
  };
};

module.exports = calculateCost;
