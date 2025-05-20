// Converts from degrees to radians.
function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Converts from radians to degrees.
function toDegrees(radians: number) {
  return (radians * 180) / Math.PI;
}

export const getDistanceBetweenCoordinates = (latA: number, lonA: number, latB: number, lonB: number): number => {
  const R = 6371e3; // metres
  const lat1 = toRadians(latA);
  const lat2 = toRadians(latB);
  const dlat = toRadians(latB - latA);
  const dlon = toRadians(lonB - lonA);

  const a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d / 1000; // in km
};

export const getDistanceBetweenCoordinatesInMiles = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const distanceInKm = getDistanceBetweenCoordinates(lat1, lon1, lat2, lon2);
  return distanceInKm * 0.621371; // Convert km to miles
};

export const getHeadingBetweenCoordinates = (latA: number, lonA: number, latB: number, lonB: number): number => {
  const lat1 = toRadians(latA);
  const lon1 = toRadians(lonA);
  const lat2 = toRadians(latB);
  const lon2 = toRadians(lonB);
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
  const heading = Math.atan2(y, x);
  return toDegrees(heading);
};
