
const { Liquidity, Currency } = require('../models');

const allCurrencies = async (req, res) => {
    const { account } = req.query;
    if (account == process.env.AdminWalletAddress) {
        const liquidities = await Liquidity.findAll({
            // order: [['createdAt', 'ASC']]
            include: [
                {
                    model: Currency,
                    as: 'currency0'
                },
                {
                    model: Currency,
                    as: 'currency1'
                }
            ]
        })
        return res.status(200).json({
            liquidities
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const addCurrency = async (req, res) => {
    const { account } = req.body;

    if (account == process.env.AdminWalletAddress) {
        const currency = await Liquidity.create({
            ...req.body,
            // isActive: true,
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

    if (account == process.env.AdminWalletAddress) {
        console.log(req.body);
        const currency = await Liquidity.update({
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
    if (account == process.env.AdminWalletAddress) {
        const liquidities = await Liquidity.destroy({
            where: {
                id: id
            }
        })
        return res.status(200).json({
            liquidities
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const stateCurrency = async (req, res) => {
    const { account } = req.body;

    if (account == process.env.AdminWalletAddress) {
        const currency = await Liquidity.update({
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

module.exports = {
    allCurrencies,
    addCurrency,
    editCurrency,
    deleteCurrency,
    stateCurrency
}