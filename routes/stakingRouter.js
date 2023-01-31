const express = require('express');
const router = express.Router();

const { StakePools } = require('../models');

router.get('/pools', async (req, res) => {
    try {
        const pools = await StakePools.findAll({
            where: {
                isFinished: false, 
            },
            order: [['createdAt', 'ASC']]
        });
        return res.status(201).json({
            pools
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

module.exports = router;