const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { YOCSwapFactory, YOC, USDCToken, YOCSwapRouter, YOCPair, TokenTemplate, YOCPool } = require("../config/contracts");

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

const scanMonitorLiquidities = async () => {
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

    let YocswapFactory = new Contract(
        YOCSwapFactory.address,
        YOCSwapFactory.abi,
        getProvider()
    )
    liquidities.forEach(async (item) => {
        let pairAddress = await YocswapFactory.getPair(item.currency0.address, item.currency1.address);
        let pairContract = new Contract(
            pairAddress,
            YOCPair.abi,
            getProvider()
        );
        // await updateSpecialLiquidity(pairContract, item);

        await pairContract.on('Mint', async (sender, a0, a1, tx) => {
            await updateSpecialLiquidity(pairContract, item);
        })
        await pairContract.on('Burn', async (sender, a0, a1, tx) => {
            await updateSpecialLiquidity(pairContract, item);
        })
        await pairContract.on('Swap', async (sender, a0, a1, tx) => {
            if (liquidity.currency0.address == USDCToken.address) {
                const currency = await Currency.update({
                    price: 1 / liquidity.rate
                }, {
                    where: {
                        address: liquidity.currency1.address
                    }
                })
                console.log(`Update USD price: ${liquidity.currency1.symbol} ${1 / liquidity.rate}`);
            } else if (liquidity.currency1.address == USDCToken.address) {
                const currency = await Currency.update({
                    price: liquidity.rate
                }, {
                    where: {
                        address: liquidity.currency0.address
                    }
                })
                console.log(`Update USD price: ${liquidity.currency0.symbol} ${liquidity.rate}`);
            }
        })
    });
}

const updateSpecialLiquidity = async (pairContract, liquidityPairData) => {
    let pairSymbol = await pairContract.symbol();
    let token0Address = await pairContract.token0();
    let amount = convertWeiToEth(await pairContract.totalSupply(), 18);
    let result = await pairContract.getReserves();
    let amount0 = convertWeiToEth(result._reserve1, liquidityPairData.currency0.decimals);
    let amount1 = convertWeiToEth(result._reserve0, liquidityPairData.currency1.decimals);
    if (liquidityPairData.currency0.address !== token0Address) {
        let tmp = amount0;
        amount0 = amount1;
        amount1 = tmp;
    }
    let rate = amount0 / amount1;

    let data = {
        ...liquidityPairData,
        amount,
        amount0,
        amount1,
        rate, 

        pairSymbol, 
        isYoc: liquidityPairData.pairAddress == YOC.address, 
        pairDecimal: 18
    }

    let state = await Liquidity.update({ ...data }, {
        where: {
            id: liquidityPairData.id
        }
    })
    console.log(`Update liquidity: ${liquidityPairData.currency0.symbol}/${liquidityPairData.currency1.symbol}`);
    console.log(`          amount: ${amount}`);
    console.log(`         amount0: ${amount0}`);
    console.log(`         amount1: ${amount1}`);
    console.log(`            rate: ${rate}\n`);

    return data;
}

module.exports = {
    allLiquidities,
    addLiquidity,
    editLiquidity,
    deleteLiquidity,
    stateLiquidity,

    viewAllLiquidities,
    scanMonitorLiquidities,
}