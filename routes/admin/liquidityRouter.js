const express = require('express');
const router = express.Router();
const liquidityController = require('../../controllers/liquidityController');

router.get('/all', liquidityController.allLiquidities);
router.post('/add', liquidityController.addLiquidity);
router.post('/update', liquidityController.editLiquidity);
router.post('/state', liquidityController.stateLiquidity);
router.delete('/delete', liquidityController.deleteLiquidity);

module.exports = router;