const express = require('express');
const router = express.Router();

const { Prices } = require('../models');

router.get('/get', async (req, res) => {
    try {
        const pools = await Prices.findAll({
            datetime: [['createdAt', 'ASC']]
        });
        return res.status(201).json({
            pools
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

module.exports = router;