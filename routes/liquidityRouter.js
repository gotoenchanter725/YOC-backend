const express = require('express');
const router = express.Router();
const liquidityController = require('../controllers/liquidityController');

router.get('/all', liquidityController.viewAllLiquidities);
router.get('/rate', liquidityController.rateLiquidity);
router.get('/user', liquidityController.userLiquidity);
router.post('/import', liquidityController.importLiquidity);

module.exports = router;