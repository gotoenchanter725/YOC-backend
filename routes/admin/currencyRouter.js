const express = require('express');
const router = express.Router();
const currencyController = require('../../controllers/currencyController');

router.get('/all', currencyController.allCurrencies);
router.post('/add', currencyController.addCurrency);
router.post('/update', currencyController.editCurrency);
router.post('/state', currencyController.stateCurrency);
router.delete('/delete', currencyController.deleteCurrency);

module.exports = router;