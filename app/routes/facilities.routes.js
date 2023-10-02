// routes/facilities.routes.js

const express = require('express');
const router = express.Router();
const facilitiesController = require('../controllers/facilities.controller');

// router.post('/create', uploadMiddleware, facilitiesController.create);
// router.get('/image/:id', facilitiesController.getImage);

router.get('/create', facilitiesController.facilitiesUploadForm)
router.post('/create', facilitiesController.facilitiesStorage)
router.put('/update/:id', facilitiesController.updateFacility)

module.exports = router;
