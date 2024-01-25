const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Create New Project
router.post('/create', projectController.create);
router.get('/', projectController.getDetails);
router.get('/time', projectController.getTime);

module.exports = router;