const express = require('express');
const router = express.Router();
const { viewAllFarms, userFarmDetail, userFarmDetailUpdateAllowance } = require('../controllers/farmController');

router.get('/all', viewAllFarms);
router.get('/user', userFarmDetail);
router.post('/user/allowance', userFarmDetailUpdateAllowance);

module.exports = router;