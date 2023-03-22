const express = require('express');
const router = express.Router();
const liquidityController = require('../controllers/liquidityController');

router.get('/get-all', liquidityController.allCurrencies);
router.post('/add', liquidityController.addCurrency);
router.post('/update', liquidityController.editCurrency);
router.post('/state', liquidityController.stateCurrency);
router.delete('/delete', liquidityController.deleteCurrency);

module.exports = router;