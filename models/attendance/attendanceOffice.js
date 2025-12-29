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

// Index for geospatial queries
attendanceOfficeSchema.index({ location: '2dsphere' });

const AttendanceOffice = mongoose.model('AttendanceOffice', attendanceOfficeSchema);

module.exports = AttendanceOffice;
