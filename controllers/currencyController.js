const { Currency } = require('../models');
const { AdminWalletAddress } = require('../config/contracts');

const allCurrencies = async (req, res) => {
    const { account } = req.query;
    if (account == AdminWalletAddress) {
        const currencies = await Currency.findAll({
            // order: [['createdAt', 'ASC']]
        })
        return res.status(200).json({
            currencies
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const addCurrency = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const currency = await Currency.create({
            ...req.body,
            isActive: true,
            isDelete: false,
        })
        return res.status(200).json({
            currency
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const editCurrency = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        console.log(req.body);
        const currency = await Currency.update({
            ...req.body
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            currency
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const deleteCurrency = async (req, res) => {
    const { id, account } = req.query;
    if (account == AdminWalletAddress) {
        const currencies = await Currency.destroy({
            where: {
                id: id
            }
        })
        return res.status(200).json({
            currencies
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const stateCurrency = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const currency = await Currency.update({
            isActive: req.body.isActive
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            currency
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

// ====================== PUBLICK ======================

const viewAllCurrencies = async (req, res) => {
    const currencies = await Currency.findAll({
        where: {
            isActive: true, 
            isDelete: false
        }
    })
    return res.status(200).json({
        currencies
    })
}

module.exports = {
    allCurrencies,
    addCurrency,
    editCurrency,
    deleteCurrency,
    stateCurrency,

    viewAllCurrencies
}