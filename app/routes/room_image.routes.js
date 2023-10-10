// routes/facilities.routes.js

const express = require('express');
const router = express.Router();
const roomImage = require('../controllers/room_image.controller');

// router.post('/create', uploadMiddleware, facilitiesController.create);
// router.get('/image/:id', facilitiesController.getImage);

router.get('/create', roomImage.roomImageUpload)
router.post('/create', roomImage.roomImageCreate)

router.get('/update', roomImage.roomImageUpload)
router.put('/update/:id', roomImage.roomImageUpdate)

module.exports = router;
