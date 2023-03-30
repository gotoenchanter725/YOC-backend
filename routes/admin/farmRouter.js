const express = require('express');
const router = express.Router();
const farmController = require('../../controllers/farmController');

router.get('/all', farmController.allFarms);
router.post('/add', farmController.addFarm);
router.post('/update', farmController.editFarm);
router.post('/state', farmController.stateFarm);
router.delete('/delete', farmController.deleteFarm);

module.exports = router;