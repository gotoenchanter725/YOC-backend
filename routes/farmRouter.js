const express = require('express');
const router = express.Router();

const { FarmsPools } = require('../models');

router.get('/pools', async (req, res) => {
    try {
        // const pools = await FarmsPools.findAll({
        //     where: {
        //         isFinished: 0, 
        //     },
        //     order: [['createdAt', 'ASC']]
        // });
        const pools = await FarmsPools.findAll();
        return res.status(201).json({
            pools
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

module.exports = router;