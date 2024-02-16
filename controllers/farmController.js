const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { MaxUint256, AddressZero, Zero } = constants;
const { YOCSwapFactory, YOC, USDCToken, YOCSwapRouter, YOCPair, YOCFarm, TokenTemplate, YOCPool, PRIVATE_KEY } = require("../config/contracts");

const { Liquidity, FarmDetail, Currency, FarmPool, Project, StakePool } = require('../models');
const { AdminWalletAddress } = require('../config/contracts');

const allFarms = async (req, res) => {
    const { account } = req.query;
    if (account == AdminWalletAddress) {
        const pools = await FarmPool.findAll({
            // order: [['createdAt', 'ASC']]
            include: [
                {
                    model: Liquidity,
                    as: 'liquidity',
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
                }
            ]
        })
        return res.status(200).json({
            pools
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const addFarm = async (req, res) => {
    const { account, isYoc, allocPoint, pairAddress } = req.body;

    if (account == AdminWalletAddress) {
        const signer = new ethers.Wallet(PRIVATE_KEY, getProvider());
        try {
            if (!req.body.allocPoint || !req.body.pairAddress) throw "invalid parameter";
            const YocFarmContract = new ethers.Contract(YOCFarm.address, YOCFarm.abi, signer);
            console.log("farm-addFarm", allocPoint, pairAddress, isYoc);
            try {
                const gasPrice = await getProvider().getGasPrice();
                console.log("gasPrice", gasPrice.toString());
                let tx = await YocFarmContract.add(
                    allocPoint,
                    pairAddress,
                    isYoc,
                    false,
                    {
                        gasLimit: 2000000,
                        gasPrice: gasPrice
                    }
                )
                await tx.wait();
            } catch (err) {
                console.log('farm-addFarm', err);
            }
            return res.status(200).json({
                success: "Pool Create"
            })
        } catch (err) {
            console.log("farm-addFarm", err);
            return res.status(500).json({ error: 'contract' })
        }
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const editFarm = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const state = await FarmPool.update({
            ...req.body
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            state
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const deleteFarm = async (req, res) => {
    const { id, account } = req.query;
    if (account == AdminWalletAddress) {
        const farms = await FarmPool.destroy({
            where: {
                id: id
            }
        })
        return res.status(200).json({
            farms
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

const stateFarm = async (req, res) => {
    const { account } = req.body;

    if (account == AdminWalletAddress) {
        const state = await FarmPool.update({
            isActive: req.body.isActive
        }, {
            where: {
                id: req.body.id
            }
        })
        return res.status(200).json({
            state
        })
    } else {
        return res.status(500).json({ error: 'you are not admin' })
    }
}

// ====================== PUBLICK ======================

const viewAllFarms = async (req, res) => {
    const pools = await FarmPool.findAll({
        // order: [['createdAt', 'ASC']]
        where: {
            isActive: true,
            isFinished: false
        },
        include: [
            {
                model: Liquidity,
                as: 'liquidity',
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
            }
        ]
    })
    return res.status(200).json({
        pools
    })
}

const scanMonitorFarms = async () => {
    try {
        const farmPools = await FarmPool.findAll({
            // order: [['createdAt', 'ASC']]
            include: [
                {
                    model: Liquidity,
                    as: 'liquidity',
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
                }
            ]
        })

        let YOCFarmContract = new Contract(
            YOCFarm.address,
            YOCFarm.abi,
            getProvider()
        )
        farmPools.forEach(async (item) => {
            let poolInfo = await YOCFarmContract.poolInfo(item.poolId);
            await updateSpecialFarm(poolInfo, item.poolId);
        });

        YOCFarmContract.on('Deposit', async (sender, pId, amount) => {
            console.log("farm-scanFarms Deposit", `${sender}, ${pId}, ${amount}`)
            let poolInfo = await YOCFarmContract.poolInfo(pId);
            await updateSpecialFarm(poolInfo, pId);

            await updateFarmDetailsByUser(sender, pId, YOCFarmContract);
        })
        YOCFarmContract.on('Withdraw', async (sender, pId, amount, yocAmount) => {
            console.log("farm-scanFarms Withdraw", `${sender}, ${pId}, ${amount}, ${yocAmount}`)
            let poolInfo = await YOCFarmContract.poolInfo(pId);
            await updateSpecialFarm(poolInfo, pId);

            await updateFarmDetailsByUser(sender, pId, YOCFarmContract);
        })


        YOCFarmContract.on('AddPool', async (pId, allocPoint, pairAddress, isYoc) => {
            console.log("farm-scanFarms", "<=========Farm&Stake Add Pool=======>")
            console.log("farm-scanFarms AddPool", `${pId}, ${allocPoint}, ${pairAddress}, ${isYoc}`)
            let poolInfo = await YOCFarmContract.poolInfo(pId);

            const liquidity = await Liquidity.findOne({
                where: {
                    pairAddress: pairAddress
                }
            })
            if (liquidity) {
                // Farm Pool Added
                console.log("farm-scanFarms", '<============= Farm Pool Added ===========>')
                const pool = await FarmPool.create({
                    liquidityId: liquidity.id,
                    poolId: pId,
                    allocPoint: allocPoint,
                    totalLPAmount: 0,
                    accYocPerShare: 0
                    // isActive: true,
                })
            } else {
                // Stake Pool Added
                console.log("farm-scanFarms", '<============= Stake Pool Added ===========>')
            }
        })

        YOCFarmContract.on('SetPool', async (pId, multiplier) => {
            console.log("farm-scanFarms SetPool", `${pId}, ${multiplier}`);
            let project = await Project.findOne({
                where: {
                    poolId: Number(pId)
                }
            })
            if (project) {
                console.log("farm-scanFarms SetPool Update Project poolId")
                project.multiplier = Number(multiplier);
                await project.save();
            } else {
                let farmPool = await FarmPool.findOne({
                    where: {
                        poolId: Number(pId)
                    }
                })
                if (farmPool) {
                    console.log("farm-scanFarms SetPool Update Farm poolId")
                    farmPool.allocPoint = Number(multiplier);
                    await farmPool.save();
                } else {
                    let stakePool = await StakePool.findOne({
                        where: {
                            poolId: Number(pId)
                        }
                    })
                    if (stakePool) {
                        console.log("farm-scanFarms SetPool Update Stake poolId")
                        stakePool.allocPoint = Number(multiplier);
                        await stakePool.save();
                    }
                }
            }
        })
    } catch (err) {
        console.log("farm-scanMonitorFarms", err);
    }
}

const updateSpecialFarm = async (poolInfo, pId) => {
    try {
        let totalLPAmount = convertWeiToEth(poolInfo.totalShare, 18);
        let accYocPerShare = convertWeiToEth(poolInfo.accYocPerShare, 18);
        let data = {
            totalLPAmount,
            accYocPerShare
        }

        let state = await FarmPool.update({ ...data }, {
            where: {
                poolId: pId
            }
        })
        console.log(`farm-updateSpecialFarm   Update FarmPool pId: ${pId}`);
        console.log(`farm-updateSpecialFarm         totalLPAmount: ${totalLPAmount}`);
        console.log(`farm-updateSpecialFarm        accYocPerShare: ${accYocPerShare}\n`);

        return data;
    } catch (err) {
        console.log("farm-updateSpecialFarm", err);
    }
}

const updateFarmDetailsByUser = async (userAddress, pId) => {
    try {
        let YOCFarmContract = new Contract(
            YOCFarm.address,
            YOCFarm.abi,
            getProvider()
        )

        let userInfo = await YOCFarmContract.userInfo(pId, userAddress);
        let userAmount = convertWeiToEth(userInfo.amount, 18);

        let farmPoolByUser = await FarmPool.findOne({
            where: {
                poolId: pId
            }
        })
        let state = 0;
        console.log("farm-updateFarmDetailsByUser 1");
        if (farmPoolByUser) {
            const pair = await FarmPool.findOne({
                include: [
                    {
                        model: Liquidity,
                        as: 'liquidity',
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
                    }
                ],
                where: {
                    poolId: pId
                }
            })
            const pairContract = new Contract(
                pair.liquidity.pairAddress + '',
                YOCPair.abi,
                getProvider()
            )
            let allowance = convertWeiToEth(await pairContract.allowance(userAddress, YOCFarm.address), 18);
            console.log("farm-updateFarmDetailsByUser allownace", allowance);

            let userDataByfarm = await FarmDetail.findOne({
                where: {
                    farmId: pair.id,
                    userAddress: userAddress
                }
            })

            if (userDataByfarm) {
                await FarmDetail.update({
                    amount: userAmount,
                    allowance: allowance,
                }, {
                    where: {
                        userAddress: userAddress,
                        farmId: farmPoolByUser.id,
                    }
                })
                console.log("farm-updateFarmDetailsByUser update");
            } else {
                await FarmDetail.create({
                    isActive: true,
                    amount: userAmount,
                    liquidityId: farmPoolByUser.liquidityId,
                    userAddress: userAddress,
                    farmId: farmPoolByUser.id,
                    allowance: allowance,
                })
                console.log("farm-updateFarmDetailsByUser create");
            }
        } else {
            state = false;
        }
        return state;
    } catch (e) {
        console.log("farm-updateFarmDetailsByUser", e);
        return false;
    }
}

const userFarmDetail = async (req, res) => {
    const { address, farmId } = req.query;
    let data = await FarmDetail.findOne({
        include: [
            {
                model: FarmPool,
                as: 'farm',
                include: [
                    {
                        model: Liquidity,
                        as: 'liquidity'
                    }
                ]
            },
        ],
        where: {
            userAddress: address,
            farmId: farmId
        }
    })
    return res.status(200).json({
        farmData: data
    })
}

const userFarmDetailUpdateAllowance = async (req, res) => {
    const { address, balance, farmId, liquidityId } = req.body;

    let data = await FarmDetail.findOne({
        where: {
            userAddress: address,
            farmId: farmId,
        }
    })
    console.log("farm-userFarmDetailUpdateAllowance", address, balance, farmId, liquidityId);
    let state = 0;
    if (data) {
        state = await FarmDetail.update({
            isActive: true,
            allowance: balance,
        }, {
            where: {
                userAddress: address,
                farmId: farmId,
            }
        })
    } else {
        state = await FarmDetail.create({
            isActive: true,
            farmId: farmId,
            liquidityId: liquidityId,
            userAddress: address,
            allowance: balance,
        })
    }
    return res.status(200).json({
        state
    })
}

module.exports = {
    allFarms,
    addFarm,
    editFarm,
    deleteFarm,
    stateFarm,

    viewAllFarms,
    scanMonitorFarms,
    userFarmDetail,
    userFarmDetailUpdateAllowance,
    updateFarmDetailsByUser
}