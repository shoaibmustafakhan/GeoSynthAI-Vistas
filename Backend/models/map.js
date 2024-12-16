const mongoose = require('mongoose');

// Define the Map Schema
const mapSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,  // The URL of the generated image
  },
  imageName: {
    type: String,
    required: true,  // The name given to the generated image
  },
  userEmail: {
    type: String,
    required: true,  // Email of the user who generated the image
  },
  createdAt: {
    type: Date,
    default: Date.now,  // Automatically set the creation date of the image
  },
});

// Create the Map Model
const Map = mongoose.model('Map', mapSchema);

module.exports = Map;
