
const { Liquidity, Currency } = require('../models');
const { AdminWalletAddress } = require('../config/contracts');

const allLiquidities = async (req, res) => {
    const { account } = req.query;
    if (account == AdminWalletAddress) {
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

const addLiquidity = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const liquidity = await Liquidity.create({
            ...req.body,
            // isActive: true,
        })
        return res.status(200).json({
            liquidity
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const editLiquidity = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        console.log(req.body);
        const liquidity = await Liquidity.update({
            ...req.body
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            liquidity
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const deleteLiquidity = async (req, res) => {
    const { id, account } = req.query;
    if (account == AdminWalletAddress) {
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

const stateLiquidity = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const liquidity = await Liquidity.update({
            isActive: req.body.isActive
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            liquidity
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

// ====================== PUBLICK ======================

const viewAllLiquidities = async (req, res) => {
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
        ], 
        where: {
            isActive: true, 
            isDelete: false
        }
    })
    return res.status(200).json({
        liquidities
    })
}

module.exports = {
    allLiquidities,
    addLiquidity,
    editLiquidity,
    deleteLiquidity,
    stateLiquidity,

    viewAllLiquidities,
}