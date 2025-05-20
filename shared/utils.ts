export const getDistanceBetweenCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
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

export const getHeadingBetweenCoordinates = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = Math.atan2(y, x);
  const brngInDegrees = (brng * 180) / Math.PI; // Convert to degrees
  return (brngInDegrees + 360) % 360; // Normalize to 0-360
};
