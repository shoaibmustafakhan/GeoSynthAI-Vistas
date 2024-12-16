// // routes/imageRoutes.js
// const express = require('express');
// const { uploadImage, addImage, getImages } = require('../controllers/imageController');
// const { protect } = require('../middleware/authMiddleware');
// const router = express.Router();

// router.route('/').get(protect, getImages).post(protect, uploadImage, addImage);

// module.exports = router;
// routes/imageRoutes.js
const express = require('express');
const { 
  uploadImage, 
  addImage, 
  getImages, 
  getAllGeneratedImage, 
  getAllGeneratedImagesByEmail, 
  getAllImagesOtherThanGenerated, 
  getAllImagesOtherThanGeneratedByEmail,
  saveGeneratedImageByEmail,
  addGeneratedImage, 

} = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get all images and add a new image
router.route('/')
  .get(protect, getImages) // Get all images
  .post(protect, uploadImage, addImage); // Upload and add a new image

// Route to get all generated images
router.post('/generated', protect, uploadImage, addGeneratedImage);

// Route to get all generated images by email
router.route('/generated/email')
  .post(protect, getAllGeneratedImagesByEmail); // Get all 'generatedImage' images by user email

  // router.route('/generated/save')
  // .post(protect, saveGeneratedImageByEmail);
// POST /api/generated/save
router.post("/generated/save", protect, saveGeneratedImageByEmail);


// Route to get all images except 'generatedImage'
router.route('/other-than-generated')
  .get(protect, getAllImagesOtherThanGenerated); // Get all images except 'generatedImage'

// Route to get all images except 'generatedImage' by email
router.route('/other-than-generated/email')
  .post(protect, getAllImagesOtherThanGeneratedByEmail); // Get all non-'generatedImage' images by user email



module.exports = router;
