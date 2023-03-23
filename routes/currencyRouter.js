const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');

router.get('/all', currencyController.viewAllCurrencies);

module.exports = router;