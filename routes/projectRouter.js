const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Create New Project
// router.post('/create', projectController.create);
router.get('/', projectController.getDetails);
router.get('/time', projectController.getTime);
router.post('/updateMultiplier', projectController.updateMultiplier);
router.post('/test', projectController.testFunction);

module.exports = router;