// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  userEmail: { type: String, required: false },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  type:{type:String, default:"uploadedImage"},
  uploadedAt: { type: Date, default: Date.now },
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
