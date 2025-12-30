const mongoose = require('mongoose');

const attendanceOfficeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Office name is required'],
        trim: true
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'companies',
        required: [true, 'Office must belong to a company']
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Office coordinates are required']
        }
    },
    radius: {
        type: Number,
        required: [true, 'Geofence radius is required'],
        default: 100 // Default radius in meters
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for latitude
attendanceOfficeSchema.virtual('latitude').get(function () {
    return this.location?.coordinates?.[1];
});

// Virtual for longitude
attendanceOfficeSchema.virtual('longitude').get(function () {
    return this.location?.coordinates?.[0];
});

// Virtual for geofence_radius (mapping from radius)
attendanceOfficeSchema.virtual('geofence_radius').get(function () {
    return this.radius;
});

// Index for geospatial queries
attendanceOfficeSchema.index({ location: '2dsphere' });

const AttendanceOffice = mongoose.model('AttendanceOffice', attendanceOfficeSchema);

module.exports = AttendanceOffice;
