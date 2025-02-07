const mongoose = require("mongoose");

const UserLocationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },    
      company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company',
        required: true  
      },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" }, 
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    address: { 
        type: String, 
        required: false 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});
// Create a **2dsphere index** for geospatial queries
UserLocationSchema.index({ location: "2dsphere" });
const UserLocation = mongoose.model("UserLocation", UserLocationSchema);
module.exports = UserLocation;
