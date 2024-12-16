const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getUserMaps, deleteMap } = require("../controllers/mapController");


// Route for saving the generated map image
router.post('/', protect, getUserMaps);
// Route for deleting a specific map by ID
router.delete("/:id", protect, deleteMap);
module.exports = router;
