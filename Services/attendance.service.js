const AttendanceLog = require('../models/attendance/attendanceLog');
const AppError = require('../utils/appError');

/**
 * Calculates the Haversine distance between two points in meters
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Validates if the user is within the office geofence
 */
exports.validateGeofence = (userLat, userLong, officeLat, officeLong, radius) => {
    const distance = exports.calculateDistance(userLat, userLong, officeLat, officeLong);
    return distance <= radius;
};

/**
 * Stub for Facial Recognition Service
 */
exports.verifyFace = async (selfieUrl, profilePhotoUrl) => {
    // Integrate with AWS Rekognition or similar here
    // Mocking 95% match for now
    return {
        match: true,
        score: 95.5
    };
};

/**
 * Checks for anomalies like GPS spoofing or impossible travel
 */
exports.detectAnomaly = async (userId, currentRecord) => {
    const lastRecord = await AttendanceLog.findOne({ user: userId })
        .sort({ timestamp: -1 });

    if (!lastRecord) return null;

    const timeDiff = (new Date(currentRecord.timestamp) - new Date(lastRecord.timestamp)) / 60000; // minutes
    const distance = exports.calculateDistance(
        lastRecord.location.coordinates[1], lastRecord.location.coordinates[0],
        currentRecord.latitude, currentRecord.longitude
    );

    // If speed exceeds 1000 km/h (approx 16.6 km/min)
    const speed = distance / (timeDiff * 60); // meters per second
    if (timeDiff > 0 && speed > 300) { // Approx 1080 km/h
        return 'impossible_travel';
    }

    return null;
};
