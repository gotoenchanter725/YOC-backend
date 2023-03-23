const express = require('express');
const router = express.Router();
const liquidityController = require('../controllers/liquidityController');

router.get('/all', liquidityController.viewAllLiquidities);

module.exports = router;