var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const feedbackQRCodeSchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  name: { type: String, required: true },
  storeId: { type: String, required: true },
  tableId: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  qrCodeDataUrl: { type: String }, // Store base64 QR code image
  createdAt: { type: Date, default: Date.now }
}, { collection: 'feedbackQRCode', timestamps: true });

module.exports = mongoose.model('FeedbackQRCode', feedbackQRCodeSchema);