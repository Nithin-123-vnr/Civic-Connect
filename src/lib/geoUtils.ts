/**
 * CivicConnect Geospatial Validation & Telangana Bounding Box Utilities
 */

// Telangana Geographic Centroid & Bounds
export const TELANGANA_DEFAULT_CENTER: [number, number] = [17.8496, 79.1151];
export const TELANGANA_BOUNDS = {
  minLat: 15.5,
  maxLat: 20.2,
  minLng: 77.0,
  maxLng: 82.0,
};

// District Approximate Centroids for accurate auto-centering
export const DISTRICT_CENTROIDS: Record<string, [number, number]> = {
  'hyderabad': [17.4065, 78.4772],
  'nalgonda': [17.0575, 79.2684],
  'wanaparthy': [16.3624, 78.0628],
  'hanumakonda': [17.9900, 79.5700],
  'warangal': [17.9689, 79.5941],
  'karimnagar': [18.4386, 79.1288],
  'khammam': [17.2473, 80.1514],
  'mahabubnagar': [16.7432, 77.9866],
  'medchal-malkajgiri': [17.5186, 78.5447],
  'rangareddy': [17.2000, 78.3000],
  'nizamabad': [18.6725, 78.0944],
  'siddipet': [18.1018, 78.8520],
  'suryapet': [17.1439, 79.6239],
  'adilabad': [19.6641, 78.5320],
  'bhadradri kothagudem': [17.5500, 80.6167],
  'jagtial': [18.7900, 78.9100],
  'jangaon': [17.7200, 79.1800],
  'jayashankar bhupalpally': [18.4300, 79.8600],
  'jogulamba gadwal': [16.2300, 77.8000],
  'kamareddy': [18.3200, 78.3400],
  'kumuram bheem': [19.3600, 79.4900],
  'mahabubabad': [17.6000, 80.0000],
  'mancherial': [18.8700, 79.4600],
  'medak': [18.0400, 78.2600],
  'mulugu': [18.1900, 80.1800],
  'nagarkurnool': [16.4800, 78.3300],
  'narayanpet': [16.7300, 77.5000],
  'nirmal': [19.0900, 78.3400],
  'peddapalli': [18.6100, 79.3800],
  'rajanna sircilla': [18.3800, 78.8000],
  'sangareddy': [17.6200, 78.0800],
  'vikarabad': [17.3300, 77.9000],
  'yadadri bhuvanagiri': [17.5100, 78.8800],
};

/**
 * Strictly validates if a coordinate is valid and within the reasonable Telangana boundary.
 * Rejects: null, undefined, NaN, (0,0), and out-of-state coordinates.
 */
export function isValidTelanganaCoordinate(lat: any, lng: any): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  if (typeof lat === 'string' && lat.trim() === '') return false;
  if (typeof lng === 'string' && lng.trim() === '') return false;

  const nLat = typeof lat === 'number' ? lat : Number(lat);
  const nLng = typeof lng === 'number' ? lng : Number(lng);

  if (isNaN(nLat) || isNaN(nLng)) return false;
  if (nLat === 0 && nLng === 0) return false;

  // Verify coordinates fall inside Telangana geographic bounding box
  if (
    nLat < TELANGANA_BOUNDS.minLat ||
    nLat > TELANGANA_BOUNDS.maxLat ||
    nLng < TELANGANA_BOUNDS.minLng ||
    nLng > TELANGANA_BOUNDS.maxLng
  ) {
    return false;
  }

  return true;
}

/**
 * Returns the recommended centroid for a given district name or defaults to Telangana centroid.
 */
export function getJurisdictionCenter(districtName?: string): [number, number] {
  if (!districtName) return TELANGANA_DEFAULT_CENTER;
  const key = districtName.trim().toLowerCase();
  return DISTRICT_CENTROIDS[key] || TELANGANA_DEFAULT_CENTER;
}
