const express = require('express');
const router = express.Router();
const { Op } = require("sequelize");

const { Price, TotalValueLockPrice } = require('../models');

router.get('/get-all', async (req, res) => {
    try {
        const prices = await Price.findAll({
            datetime: [['createdAt', 'ASC']]
        });
        return res.status(201).json({
            prices
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

router.get('/get', async (req, res) => {
    try {
        const prices = await Price.findAll({
            datetime: [['createdAt', 'ASC']],
            where: {
                datetime: { [Op.gt]: Date.now() - (req.query.period ? req.query.period : 1000 * 60 * 60 * 5) }
            }
        });
        return res.status(201).json({
            prices
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

router.get('/tvl-get', async (req, res) => {
    try {
        const totalValueLockUSDPrices = await TotalValueLockPrice.findAll({
            datetime: [['createdAt', 'ASC']],
            where: {
                datetime: { [Op.gt]: Date.now() - (req.query.period ? req.query.period : 1000 * 60 * 60 * 24) }
            }
        });
        return res.status(201).json({
            prices: totalValueLockUSDPrices
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

module.exports = router;