const express = require('express');
const router = express.Router();
const { viewAllStakes, userStakeDetail, userStakeDetailUpdateAllowance } = require('../controllers/stakeController');

router.get('/all', viewAllStakes);
router.get('/user', userStakeDetail);
router.post('/user/allowance', userStakeDetailUpdateAllowance);

module.exports = router;