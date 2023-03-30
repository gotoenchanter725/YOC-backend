const express = require('express');
const router = express.Router();
const stakeController = require('../../controllers/stakeController');

router.get('/all', stakeController.allStakes);
router.post('/add', stakeController.addStake);
router.post('/update', stakeController.editStake);
router.post('/state', stakeController.stateStake);
router.delete('/delete', stakeController.deleteStake);

module.exports = router;