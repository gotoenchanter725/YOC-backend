const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { Price, FarmPool, StakePool, TotalValueLockPrice, Currency, Liquidity } = require('../models');
const { ProjectManager, YOCSwapFactory, YOC, YUSD, USDCToken, YOCSwapRouter, YOCPair, TokenTemplate, YOCPool, Project, WETH } = require("../config/contracts");
const _ = require("lodash");
var format = require('date-format');
const { PRIVATE_KEY } = require('../config/contract');

const storeYocPricePerHour = async () => {
    try {
        let swapContract = new Contract(
            YOCSwapRouter.address,
            YOCSwapRouter.abi,
            getProvider()
        )

        while (true) {
            let t_prices = [], fromDate = new Date();
            for (let i = 0; i < 3; i++) {
                let res = await swapContract.getExpectLiquidityAmount(YOC.address, USDCToken.address, convertEthToWei('1', YOC.decimals));
                let yPrice = convertWeiToEth(res, USDCToken.decimals);
                console.log("chart-storeYocPricePerHour", i + 1, +yPrice);
                t_prices.push(+yPrice);
                console.log("chart-storeYocPricePerHour", format('yyyy-MM-dd hh:mm:ss', new Date()));
                await delay(1000 * 60 * 18); // 18mins * 3
            }
            toDate = new Date();
            console.log("chart-storeYocPricePerHour", "<===== Save Data ====>")
            console.log("chart-storeYocPricePerHour", {
                high: _.max(t_prices),
                low: _.min(t_prices),
                from: t_prices[0],
                to: t_prices[t_prices.length - 1],
                prices: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

                fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
                toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
                datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
            })
            const newPrice = await Price.create({
                high: _.max(t_prices),
                low: _.min(t_prices),
                from: t_prices[0],
                to: t_prices[t_prices.length - 1],
                price: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

                fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
                toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
                datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
            });
        }
    } catch (err) {
        console.log("chart-storeYocPricePerHour", err);
    }
}

const storeTVLPerHour = async () => {
    try {
        while (true) {
            let t_prices = [], fromDate = new Date();
            for (let i = 0; i < 2; i++) {
                let tPrice = 0;
                tPrice += await getTotalUSD();
                tPrice += await getTotalUSDOfFunds();
                console.log("chart-storeTVLPerHour", "Price:", tPrice);
                console.log("chart-storeTVLPerHour", i + 1, +tPrice);
                t_prices.push(+tPrice);
                console.log("chart-storeTVLPerHour", format('yyyy-MM-dd hh:mm:ss', new Date()));
                console.log("delay per one loop")
                await delay(1000 * 60 * 28); // 28 mins * 2
            }
            toDate = new Date();
            console.log("chart-storeTVLPerHour", "<===== Save Data ====>")
            console.log("chart-storeTVLPerHour", {
                high: _.max(t_prices),
                low: _.min(t_prices),
                from: t_prices[0],
                to: t_prices[t_prices.length - 1],
                price: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

                fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
                toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
                datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
            })
            const newPrice = await TotalValueLockPrice.create({
                high: _.max(t_prices),
                low: _.min(t_prices),
                from: t_prices[0],
                to: t_prices[t_prices.length - 1],
                price: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

                fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
                toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
                datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
            });
            console.log("chart-storeTVLPerHour", "Save TVL")
        }
    } catch (err) {
        console.log("chart-storeTVLPerHour", err);
    }
}

const getTotalUSD = async () => {
    try {
        let swapRouterContract = new Contract(
            YOCSwapRouter.address,
            YOCSwapRouter.abi,
            getProvider()
        );
        let swapFactoryContract = new Contract(
            YOCSwapFactory.address,
            YOCSwapFactory.abi,
            getProvider()
        );
        console.log("chart-getTotalUSD", "<=== start farms pool ===>");
        const farmPoolsData = await FarmPool.findAll({
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
                isFinished: false,
            },
            order: [['createdAt', 'ASC']]
        });
        let poolLength = farmPoolsData.length;
        console.log("chart-getTotalUSD", "FarmsPools: ", + poolLength);

        let totalUSD = 0;

        for (let i = 0; i < poolLength; i++) {
            let pairAddress = farmPoolsData[i].liquidity.pairAddress;
            let pairContract = new Contract(
                pairAddress,
                YOCPair.abi,
                getProvider()
            )
            let token0Address = farmPoolsData[i].liquidity.currency0.address;
            let token1Address = farmPoolsData[i].liquidity.currency1.address;
            let token0Contract = new Contract(
                token0Address,
                TokenTemplate.abi,
                getProvider()
            )
            let token0Decimal = farmPoolsData[i].liquidity.currency0.decimals;
            let token1Contract = new Contract(
                token1Address,
                TokenTemplate.abi,
                getProvider()
            )
            let token1Decimal = farmPoolsData[i].liquidity.currency1.decimals;

            let amount0 = convertWeiToEth(await token0Contract.balanceOf(pairAddress), token0Decimal);
            let amount1 = convertWeiToEth(await token1Contract.balanceOf(pairAddress), token1Decimal);

            let usdBalance = 0;

            if (token0Address != USDCToken.address) {
                try {
                    usdBalance += Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                        convertEthToWei(amount0, token0Decimal),
                        [
                            token0Address,
                            USDCToken.address
                        ]
                    ))[1], USDCToken.decimals));
                } catch (err) {
                    usdBalance = 0;
                }
            } else {
                usdBalance += Number(amount0)
            }

            if (token1Address != USDCToken.address) {
                try {
                    usdBalance += Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                        convertEthToWei(amount1, token1Decimal),
                        [
                            token1Address,
                            USDCToken.address
                        ]
                    ))[1], USDCToken.decimals));
                } catch (err) {
                    usdBalance == 0;
                }
            } else {
                usdBalance += Number(amount1)
            }
            console.log("Pair:", usdBalance);
            totalUSD += usdBalance;
        }
        console.log("chart-getTotalUSD", "<=== end farms pool and start stakepools ===>");

        const poolsData = await StakePool.findAll({
            include: [
                {
                    model: Currency,
                    as: 'currency'
                }
            ],
            where: {
                isFinished: false,
            },
            order: [['createdAt', 'ASC']]
        });
        console.log("chart-getTotalUSD", "StakePools: ", poolsData.length)
        for (let i = 0; i < poolsData.length; i++) {
            const stakingContract = new Contract(
                poolsData[i].address,
                (poolsData[i].isYoc ? YOCPool.abi : YOCPool.TokenABI),
                getProvider()
            )

            const tokenAddress = poolsData[i].currency.address;
            const tokenContact = new Contract(
                tokenAddress,
                TokenTemplate.abi,
                getProvider()
            );
            const stakeDecimal = poolsData[i].currency.decimals;

            console.log("chart-getTotalUSD contract connect!");

            let stakeAmount = await tokenContact.balanceOf(poolsData[i].address);
            let totalLiquidity = convertWeiToEth(stakeAmount, stakeDecimal);
            let stakedTotalUSDRes = 0;
            console.log("chart-getTotalUSD Balance:", totalLiquidity);

            if (tokenAddress != USDCToken.address && Number(totalLiquidity)) {
                try {
                    stakedTotalUSDRes = Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                        convertEthToWei(totalLiquidity, stakeDecimal),
                        [
                            tokenAddress,
                            USDCToken.address
                        ]
                    ))[1], USDCToken.decimals));
                } catch (error) {
                    console.log(error);
                    stakedTotalUSDRes = 0;
                }
            } else {
                stakedTotalUSDRes = Number(totalLiquidity)
            }
            console.log("chart-getTotalUSD", 'TOKEN: ', stakedTotalUSDRes);
            totalUSD += stakedTotalUSDRes;
        }
        console.log("chart-getTotalUSD", "<=== end stakepools ===>");

        return totalUSD;
    } catch (err) {
        console.log("chart-getTotalUSD", err);
        return 0;
    }
}

const getTotalUSDOfFunds = async () => {
    try {
        const ProjectManagerInstance = new Contract(ProjectManager.address, ProjectManager.abi, getProvider());
        const projects = await ProjectManagerInstance.getProjectAllContract();
        let swapRouterContract = new Contract(
            YOCSwapRouter.address,
            YOCSwapRouter.abi,
            getProvider()
        );
        let usdBalance = 0;
        for (let i = 0; i < projects.length; i++) {
            try {
                const projectContract = new Contract(projects[i], Project.abi, getProvider());
                const investTokenAddress = await projectContract.investToken();
                const investContract = new Contract(investTokenAddress, TokenTemplate.abi, getProvider());
                const investTokenSymbol = await investContract.symbol();
                const investTokenDecimals = await investContract.decimals();
                const investTokenBalanceOfProject = convertWeiToEth(await investContract.balanceOf(projects[i]), investTokenDecimals);
                console.log(investTokenAddress, USDCToken.address, investTokenBalanceOfProject)
                if (investTokenAddress != USDCToken.address && investTokenBalanceOfProject) {
                    try {
                        usdBalance += Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                            convertEthToWei(investTokenBalanceOfProject, investTokenDecimals),
                            [
                                investTokenAddress,
                                USDCToken.address
                            ]
                        ))[1], USDCToken.decimals));
                    } catch (err) {
                        usdBalance += 0;
                    }
                } else {
                    usdBalance += Number(investTokenBalanceOfProject)
                }
                console.log("chart-getTotalUSDOfFunds", `Project: ${projects[i]}, invest: ${investTokenAddress}, ${investTokenBalanceOfProject} ${investTokenSymbol}, ${usdBalance} USD`);
            } catch (err) {
                console.log("chart-getTotalUSDOfFunds", err.name);
                continue;
            }
        }
        return usdBalance;
    } catch (err) {
        console.log("chart-getTotalUSDOfFunds", err);
        return 0;
    }
}

const monitorYUSD = async () => {
    try {
        const signer = new ethers.Wallet(PRIVATE_KEY, getProvider());
        let YUSDContract = new Contract(
            YUSD.address,
            YUSD.abi,
            signer
        );
        YUSDContract.on("SetAutoFunction1Action", (state) => {
            console.log("YUSD: Changed AutoFunction1Action:", state);
        })
        while (true) {
            try {
                console.log("YUSD:")
                let auto = await YUSDContract.autoFunction1Action();
                console.log("YUSD: auto", auto);
                if (auto) {
                    let price = convertWeiToEth(await YUSDContract.price(), YUSD.decimals);
                    console.log("YUSD: price", price);
                    if (price > 2) {
                        console.log("YUSD: function1");
                        await YUSDContract.function1({
                            gasLimit: 110000
                        });
                    }
                }

                // update ETH USD price
                let USDPriceOfETH = ethers.utils.formatUnits(await YUSDContract.getETHPrice(), 6);
                await Currency.update({
                    price: USDPriceOfETH
                }, {
                    where: {
                        address: WETH
                    }
                })
                console.log("USDPriceOfETH", USDPriceOfETH);
                await delay(1000 * 60 * 10); // 10mins
            } catch (err) {
                console.log("YUSD: in while", err)
            }
        }
    } catch (error) {
        console.log("YUSD:", error);
    }
}

module.exports = {
    storeYocPricePerHour,
    storeTVLPerHour,
    monitorYUSD
}