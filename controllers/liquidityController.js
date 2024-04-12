const { Op } = require('sequelize');
const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { MaxUint256, AddressZero, Zero } = constants;
const { YOCSwapFactory, WETH, YOC, USDCToken, YOCSwapRouter, YOCPair, TokenTemplate, YOCPool } = require("../config/contracts");

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

const importLiquidity = async (req, res) => {
    const { account, currency0: currency0Address, currency1: currency1Address } = req.body;

    if (account && currency0Address && currency1Address) {
        console.log(account, currency0Address, currency1Address);
        let liquidityPool = await Liquidity.findOne({
            include: [
                {
                    model: Currency,
                    as: 'currency0',
                    where: {
                        address: [currency0Address, currency1Address]
                    }
                },
                {
                    model: Currency,
                    as: 'currency1',
                    where: {
                        address: [currency0Address, currency1Address]
                    }
                }
            ],
            where: {
                [Op.or]: [
                    {
                        '$currency0.address$': currency0Address,
                        '$currency1.address$': currency1Address,
                    },
                    {
                        '$currency0.address$': currency1Address,
                        '$currency1.address$': currency0Address,
                    }
                ]
            }
        })

        if (liquidityPool) {

            let userDetailOfLiquidity = await LiquidityDetail.findOne({
                where: {
                    liquidityId: liquidityPool.id,
                    userAddress: account
                }
            })
            if (userDetailOfLiquidity) {
                await userDetailOfLiquidity.update({
                    isActive: true
                });
            } else {
                let newUserDetailOfLiquidity = await LiquidityDetail.create({
                    liquidityId: liquidityPool.id,
                    userAddress: account,
                    isActive: true
                })
            }
            return res.status(200).json({
                liquidityPool
            })
        } else {
            return res.status(204).json()
        }

    } else {
        return res.status(500).json({ error: 'invalid param' })
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

// ====================== PUBLIC ======================

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
    try {
        monitorSwapRouter();

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

            await pairContract.on('Burn', async (sender, a0, a1, to) => {
                let liquidity = await updateSpecialLiquidity(pairContract, item);
                updateLiquidityDetailsByUser(to, item);
            })
            await pairContract.on('Swap', async (sender, in0, in1, out0, out1, to) => {
                let liquidity = await updateSpecialLiquidity(pairContract, item);
            })
        });

        await YocswapFactory.on("PairCreated", async (token0, token1, pair, pid) => {
            console.log(`liquidity-scanMonitorLiquidities   Detected New Pair! ${token0} ${token1}`)
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
            console.log('liquidity-scanMonitorLiquidities  ', currency0, currency1);
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

            await pairContract.on('Burn', async (sender, a0, a1, to) => {
                let liquidity = await updateSpecialLiquidity(pairContract, item);
                updateLiquidityDetailsByUser(to, item);
            })
            await pairContract.on('Swap', async (sender, in0, in1, out0, out1, to) => {
                let liquidity = await updateSpecialLiquidity(pairContract, item);
            })
        })
    } catch (err) {
        console.log("liquidity-scanMonitorLiquidities", err);
    }
}

const monitorSwapRouter = async () => {
    let swapFactoryContract = new Contract(
        YOCSwapFactory.address,
        YOCSwapFactory.abi,
        getProvider()
    )

    let swapRouterContract = new Contract(
        YOCSwapRouter.address,
        YOCSwapRouter.abi,
        getProvider()
    )

    swapRouterContract.on("AddLiquidity", async (addresses, amounts) => {
        let token0 = addresses[0];
        let token1 = addresses[1];
        let pairAddress = addresses[2];
        let user = addresses[3];

        let amount0 = amounts[0];
        let amount1 = amounts[1];
        let lp = amounts[2];
        console.log(`liquidity-monitorSwapRouter AddLiqutidy! ${token0} ${token1} ${pairAddress}`);
        console.log('====== start 10s delay while create the pair in another thread ======');
        await delay(10 * 1000);
        let pairContract = new Contract(
            pairAddress,
            YOCPair.abi,
            getProvider()
        );

        let data = await Liquidity.findOne({
            where: {
                pairAddress: pairAddress
            },
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
        if (!data) {
            console.log(`liquidity-monitorSwapRouter Detected New Pair! ${token0} ${token1}`)
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
            console.log('liquidity-monitorSwapRouter  ', currency0, currency1);
            let poolId = await swapFactoryContract.allPairs();
            await Liquidity.create({
                poolId: poolId - 1,
                pairAddress: pairAddress,
                pairDecimals: 18,
                pairSymbol: "Yoc-LP",
                isYoc: token0 == YOC.address || token1 == YOC.address,
                token0: currency0,
                token1: currency1,
            });
            data = await Liquidity.findOne({
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
                    poolId: poolId - 1
                }
            })
        }

        if (data) {
            console.log('liquidity-monitorSwapRouter  Update Data');
            await updateSpecialLiquidity(pairContract, data);
            await updateLiquidityDetailsByUser(user, data);
        }
    })
}

const updateSpecialLiquidity = async (pairContract, liquidityPairData) => {
    try {
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
        console.log(`liquidity-updateSpecialLiquidity  Update liquidity: ${liquidityPairData.currency0.symbol}/${liquidityPairData.currency1.symbol}`);
        console.log(`liquidity-updateSpecialLiquidity            amount: ${amount}`);
        console.log(`liquidity-updateSpecialLiquidity           ${liquidityPairData.token0} amount0 ${token0Address} : ${liquidityPairData.currency0.address} : ${liquidityPairData.currency0.symbol} : ${amount0}`);
        console.log(`liquidity-updateSpecialLiquidity           ${liquidityPairData.token1} amount1 ${token1Address} : ${liquidityPairData.currency1.address} : ${liquidityPairData.currency1.symbol} : ${amount1}`);
        console.log(`liquidity-updateSpecialLiquidity              rate: ${rate}\n`);


        if (liquidityPairData.currency0.address == WETH) {
            const currency = await Currency.update({
                price: rate
            }, {
                where: {
                    address: liquidityPairData.currency1.address
                }
            })
            console.log(`liquidity-updateSpecialLiquidity  Update ETH Value: ${liquidityPairData.currency1.symbol} ${rate} ETH`);
        } else if (liquidityPairData.currency1.address == WETH) {
            const currency = await Currency.update({
                price: 1 / rate
            }, {
                where: {
                    address: liquidityPairData.currency0.address
                }
            })
            console.log(`liquidity-updateSpecialLiquidity  Update ETH Value: ${liquidityPairData.currency0.symbol} ${1 / rate} ETH`);
        }

        return data;
    } catch (err) {
        console.log("liquidity-updateSpecialLiquidity", err);
    }
}

const updateLiquidityDetailsByUser = async (userAddress, liquidityPairData) => {
    try {
        console.log("liquidity-updateLiquidityDetailsByUser: ", userAddress, liquidityPairData.id);
        let data = await LiquidityDetail.findOne({
            where: {
                userAddress: userAddress,
                liquidityId: liquidityPairData.id
            }
        })
        console.log(data);
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
    } catch (err) {
        console.log("liquidity-updateLiquidityDetailsByUser", err);
    }
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
        console.log("rateLiquidity: ", item.currency0.address, item.currency1.address);
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
    try {
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
            let allowance = convertWeiToEth(await pairContract.allowance(address, YOCSwapRouter.address), 18);
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
                allowance,
                item,
                currency0,
                currency1,
                isActive: balance != 0
            }
        }
        return res.status(200).json({
            liquidityData: liquidityData.filter((item) => item.isActive)
        })
    } catch (err) {
        console.log("liquidity-userLiquidity", err);
    }
}

const getLiquidityPoolByTokens = async (req, res) => {
    const { token0: currency0Address, token1: currency1Address } = req.query;
    try {
        if (token0 && token0) {
            let liquidityPool = await Liquidity.findOne({
                include: [
                    {
                        model: Currency,
                        as: 'currency0',
                        where: {
                            address: [currency0Address, currency1Address]
                        }
                    },
                    {
                        model: Currency,
                        as: 'currency1',
                        where: {
                            address: [currency0Address, currency1Address]
                        }
                    }
                ],
                where: {
                    [Op.or]: [
                        {
                            '$currency0.address$': currency0Address,
                            '$currency1.address$': currency1Address,
                        },
                        {
                            '$currency0.address$': currency1Address,
                            '$currency1.address$': currency0Address,
                        }
                    ]
                }
            })

            if (liquidityPool) {
                return res.status(200).json({ pool: liquidityPool });
            } else {
                return res.status(500).json({ error: 'there is not a pool.' });
            }
        } else {
            return res.status(500).json({ error: 'need the token addresses' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'server error' });
    }
}

const getSwapPriceImpactByTokens = async (req, res) => {
    const { token0: currency0Address, token1: currency1Address, amountIn, amountOut } = req.query;
    console.log(currency0Address, currency1Address, amountIn, amountOut);
    try {
        if (currency0Address && currency1Address) {
            let liquidityPool = await Liquidity.findOne({
                include: [
                    {
                        model: Currency,
                        as: 'currency0',
                        where: {
                            address: [currency0Address, currency1Address]
                        }
                    },
                    {
                        model: Currency,
                        as: 'currency1',
                        where: {
                            address: [currency0Address, currency1Address]
                        }
                    }
                ],
                where: {
                    [Op.or]: [
                        {
                            '$currency0.address$': currency0Address,
                            '$currency1.address$': currency1Address,
                        },
                        {
                            '$currency0.address$': currency1Address,
                            '$currency1.address$': currency0Address,
                        }
                    ]
                }
            })
            if (liquidityPool) {
                let amount0OfPool, amount1OfPool;
                if (liquidityPool.currency0.address == currency0Address) {
                    amount0OfPool = Number(liquidityPool.amount0);
                    amount1OfPool = Number(liquidityPool.amount1);
                } else {
                    amount0OfPool = Number(liquidityPool.amount1);
                    amount1OfPool = Number(liquidityPool.amount0);
                }
                let oldPrice = amount0OfPool / amount1OfPool;
                let newPrice = Number(amountIn) / Number(amountOut);
                console.log(oldPrice, newPrice);
                let priceImpact = newPrice / oldPrice - 1;
                return res.status(200).json({ priceImpact });
            } else {
                return res.status(500).json({ error: 'there is not a pool.' });
            }
        } else {
            return res.status(500).json({ error: 'need the token addresses' });
        }
    } catch (err) {
        return res.status(500).json({ error: 'server error' });
    }
}

module.exports = {
    allLiquidities,
    addLiquidity,
    importLiquidity,
    editLiquidity,
    deleteLiquidity,
    stateLiquidity,
    getLiquidityPoolByTokens,
    getSwapPriceImpactByTokens,
    viewAllLiquidities,
    rateLiquidity,
    scanMonitorLiquidities,
    userLiquidity
}