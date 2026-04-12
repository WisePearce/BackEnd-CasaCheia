import { configDotenv } from "dotenv";

//valor do raio da terra
const EARTH_RADIUS_KM = 6371;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c; // distância em km
};

const calculateDeliveryFee = (distanceKm) => {
  const BASE_FEE = Number(process.env.DELIVERY_BASE_FEE) || 500;
  const FEE_PER_KM = Number(process.env.DELIVERY_FEE_PER_KM) || 150;
  const MAX_FEE = Number(process.env.DELIVERY_MAX_FEE) || 5000;
  const FREE_RADIUS_KM = Number(process.env.DELIVERY_FREE_RADIUS_KM) || 2;

  if (distanceKm <= FREE_RADIUS_KM) return 0;

  const fee = BASE_FEE + (distanceKm * FEE_PER_KM);
  return Math.min(Math.round(fee), MAX_FEE);
};

export {
  calculateDistance,
  calculateDeliveryFee,
}