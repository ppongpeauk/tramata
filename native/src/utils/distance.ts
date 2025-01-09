/**
 * @author Pete Pongpeauk <ppongpeauk@gmail.com>
 * @description Utility functions for calculating distances.
 */

/**
 * Calculate the distance between two points on the Earth's surface using the Haversine formula.
 * @param lat1 - The latitude of the first point.
 * @param lon1 - The longitude of the first point.
 * @param lat2 - The latitude of the second point.
 * @param lon2 - The longitude of the second point.
 * @returns The distance between the two points in meters.
 */
export function haversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
) {
	const R = 6371000; // Earth's radius in meters
	const dLat = (lat2 - lat1) * (Math.PI / 180);
	const dLon = (lon2 - lon1) * (Math.PI / 180);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * (Math.PI / 180)) *
			Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}
