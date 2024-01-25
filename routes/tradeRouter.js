const express = require('express');
const router = express.Router();
const {
    allTradeProject,
    allTradeOrdersByAddress,
    tradedYUSDByAddress,
    projectDetailByPtokenAddress,
    pricesByPtokenAddress,
    volumeByPtokenAddressForPeriod,
    allTransactionByOrderId
} = require('../controllers/tradeController');

router.get('/tradeProjects', allTradeProject);
router.get('/tradeOrdersByAddress', allTradeOrdersByAddress);
router.get('/projectDetailByPtokenAddress', projectDetailByPtokenAddress);
router.get('/tradeYUSDByAddress', tradedYUSDByAddress);
router.get('/pricesByPtokenAddress', pricesByPtokenAddress);
router.get('/volumeByPtokenAddressForPeriod', volumeByPtokenAddressForPeriod);
router.get('/allTransactionByOrderId', allTransactionByOrderId);

module.exports = router;