const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { MaxUint256, AddressZero, Zero } = constants;
const { YOCSwapFactory, YOC, USDCToken, YOCSwapRouter, YOCPair, TokenTemplate, YOCPool } = require("../config/contracts");

const { Liquidity, LiquidityDetail, Currency } = require('../models');
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
        if (pairAddress == AddressZero) return;
        let pairContract = new Contract(
            pairAddress,
            YOCPair.abi,
            getProvider()
        );
        await updateSpecialLiquidity(pairContract, item);

        await pairContract.on('Mint', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
            updateLiquidityDetailsByUser(sender, item);
        })
        await pairContract.on('Burn', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
            updateLiquidityDetailsByUser(sender, item);
        })
        await pairContract.on('Swap', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
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

    await YocswapFactory.on("PairCreated", async (token0, token1, pair, pid) => {
        console.log(`Detected New Pair! ${token0} ${token1}`)
        const currency0 = (await Currency.findOne({
            where: {
                address: token0
            }
        })).id;
        const currency1 = (await Currency.findOne({
            where: {
                address: token1
            }
        })).id;
        console.log(currency0, currency1);
        await Liquidity.create({
            poolId: pid - 1,
            pairAddress: pair,
            pairDecimals: 18,
            pairSymbol: "Yoc-LP",
            isYoc: token0 == YOC.address || token1 == YOC.address,
            token0: currency0,
            token1: currency1,
        });
        const item = await Liquidity.findOne({
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
                poolId: pid - 1
            }
        })

        let pairAddress = await YocswapFactory.getPair(item.currency0.address, item.currency1.address);
        let pairContract = new Contract(
            pairAddress,
            YOCPair.abi,
            getProvider()
        );

        await updateSpecialLiquidity(pairContract, item);

        await pairContract.on('Mint', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
            updateLiquidityDetailsByUser(sender, item);
        })
        await pairContract.on('Burn', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
            updateLiquidityDetailsByUser(sender, item);
        })
        await pairContract.on('Swap', async (sender, a0, a1, tx) => {
            let liquidity = await updateSpecialLiquidity(pairContract, item);
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
    })
}

const updateSpecialLiquidity = async (pairContract, liquidityPairData) => {
    let pairSymbol = await pairContract.symbol();
    let token0Address = await pairContract.token0();
    let token1Address = await pairContract.token1();
    let amount = convertWeiToEth(await pairContract.totalSupply(), 18);
    let result = await pairContract.getReserves();
    let amount0, amount1;
    amount0 = convertWeiToEth(result._reserve0, liquidityPairData.currency0.decimals);
    amount1 = convertWeiToEth(result._reserve1, liquidityPairData.currency1.decimals);
    if (liquidityPairData.currency0.address.toLocaleLowerCase() != token0Address.toLocaleLowerCase()) {
        let temp = amount1;
        amount1 = amount0;
        amount0 = temp;
    }
    let rate = amount0 / amount1;

    let data = {
        ...liquidityPairData,
        amount,
        amount0,
        amount1,
        rate,

        pairAddress: pairContract.address,
        pairSymbol,
        isYoc: liquidityPairData.currency0.address == YOC.address || liquidityPairData.currency1.address == YOC.address,
        pairDecimals: 18
    }

    let state = await Liquidity.update({ ...data }, {
        where: {
            id: liquidityPairData.id
        }
    })
    console.log(`Update liquidity: ${liquidityPairData.currency0.symbol}/${liquidityPairData.currency1.symbol}`);
    console.log(`          amount: ${amount}`);
    console.log(`         ${liquidityPairData.token0} amount0 ${token0Address} : ${liquidityPairData.currency0.address} : ${liquidityPairData.currency0.symbol} : ${amount0}`);
    console.log(`         ${liquidityPairData.token1} amount1 ${token1Address} : ${liquidityPairData.currency1.address} : ${liquidityPairData.currency1.symbol} : ${amount1}`);
    console.log(`            rate: ${rate}\n`);

    return data;
}

const updateLiquidityDetailsByUser = async (userAddress, liquidityPairData) => {
    console.log("updateLiquidityDetailsByUser: ", userAddress, liquidityPairData.id);
    let data = await LiquidityDetail.findOne({
        where: {
            userAddress: userAddress,
            liquidityId: liquidityPairData.id
        }
    })
    let state = 0;
    if (data) {
        state = await LiquidityDetail.update({
            isActive: true
        }, {
            where: {
                userAddress: userAddress,
                liquidityId: liquidityPairData.id,
            }
        })
    } else {
        state = await LiquidityDetail.create({
            liquidityId: liquidityPairData.id,
            userAddress: userAddress,
            isActive: true
        })
    }
    return state;
}

const rateLiquidity = async (req, res) => {
    let all = await Liquidity.findAll({
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
    })
    let rate = 0;
    for (let i = 0; i < all.length; i++) {
        const item = all[i];
        console.log(item.currency0.address, item.currency1.address);
        if (item.currency0.address == req.query.in && item.currency1.address == req.query.out) {
            rate = item.rate;
            break;
        } else if (item.currency0.address == req.query.out && item.currency1.address == req.query.in) {
            rate = 1 / item.rate;
            break;
        }
    }

    return res.status(200).json({
        rate
    })
}

const userLiquidity = async (req, res) => {
    const { address } = req.query;
    let liquidityData = await LiquidityDetail.findAll({
        include: [
            {
                model: Liquidity,
                as: 'liquidity'
            },
        ],
        where: {
            userAddress: address,
            isActive: true
        }
    })
    for (let i = 0; i < liquidityData.length; i++) {
        let item = liquidityData[i];
        const pairContract = new Contract(
            item.liquidity.pairAddress,
            YOCPair.abi,
            getProvider()
        )
        let balance = convertWeiToEth(await pairContract.balanceOf(address), 18);
        item.userLPAmount = balance;
        let currency0 = await Currency.findOne({
            where: {
                id: item.liquidity.token0
            }
        });
        let currency1 = await Currency.findOne({
            where: {
                id: item.liquidity.token1
            }
        });
        liquidityData[i] = {
            LPBalance: balance,
            item,
            currency0,
            currency1,
            isActive: balance != 0
        }
    }
    return res.status(200).json({
        liquidityData: liquidityData.filter((item) => item.isActive)
    })
}

module.exports = {
    allLiquidities,
    addLiquidity,
    editLiquidity,
    deleteLiquidity,
    stateLiquidity,

    viewAllLiquidities,
    rateLiquidity,
    scanMonitorLiquidities,
    userLiquidity
}