const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { Price, StakePool, TotalValueLockPrice } = require('../models');
const { YOCSwapFactory, YOC, USDCToken, YOCSwapRouter, YOCPair, TokenTemplate, YOCPool } = require("../config/contracts");
const _ = require("lodash");
var format = require('date-format');

const storeYocPricePer20mins = async () => {
    let swapContract = new Contract(
        YOCSwapRouter.address,
        YOCSwapRouter.abi,
        getProvider()
    )

    while (true) {
        let t_prices = [], fromDate = new Date();
        for (let i = 0; i < 10; i++) {
            let res = await swapContract.getExpectLiquidityAmount(YOC.address, USDCToken.address, convertEthToWei('1', YOC.decimals));
            let yPrice = convertWeiToEth(res, USDCToken.decimals);
            // console.log(i + 1, +yPrice);
            t_prices.push(+yPrice);
            // console.log(format('yyyy-MM-dd hh:mm:ss', new Date()));
            await delay(1000 * 10);
        }
        toDate = new Date();
        // console.log("<===== Save Data ====>")
        // console.log({
        //     high: _.max(t_prices),
        //     low: _.min(t_prices),
        //     from: t_prices[0],
        //     to: t_prices[t_prices.length - 1],
        //     prices: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

        //     fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
        //     toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
        //     datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
        // })
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
        await delay(1000 * 60);
    }
}

const storeTVLPer20mins = async () => {

    while (true) {
        let t_prices = [], fromDate = new Date();
        for (let i = 0; i < 2; i++) {
            let tPrice = await getTotalUSD()
            console.log("Price:", tPrice);
            console.log(i + 1, +tPrice);
            t_prices.push(+tPrice);
            console.log(format('yyyy-MM-dd hh:mm:ss', new Date()));
        }
        toDate = new Date();
        console.log("<===== Save Data ====>")
        console.log({
            high: _.max(t_prices),
            low: _.min(t_prices),
            from: t_prices[0],
            to: t_prices[t_prices.length - 1],
            prices: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

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
        console.log("Save TVL")
        await delay(1000 * 1);
    }
}

const getTotalUSD = async () => {
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
    let poolLength = await swapFactoryContract.allPairsLength();
    console.log(+ poolLength);

    let totalUSD = 0;

    for (let i = 0; i < poolLength; i++) {
        let pairAddress = await swapFactoryContract.allPairs(i);
        let pairContract = new Contract(
            pairAddress,
            YOCPair.abi,
            getProvider()
        )
        let token0Address = await pairContract.token0();
        let token1Address = await pairContract.token1();
        let token0Contract = new Contract(
            token0Address,
            TokenTemplate.abi,
            getProvider()
        )
        let token0Decimal = await token0Contract.decimals();
        let token1Contract = new Contract(
            token1Address,
            TokenTemplate.abi,
            getProvider()
        )
        let token1Decimal = await token1Contract.decimals();

        let amount0 = convertWeiToEth(await token0Contract.balanceOf(pairAddress), token0Decimal);
        let amount1 = convertWeiToEth(await token1Contract.balanceOf(pairAddress), token1Decimal);

        let usdBalance = 0;

        if (token0Address != USDCToken.address) {
            usdBalance += Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                convertEthToWei(amount0, token0Decimal),
                [
                    token0Address,
                    USDCToken.address
                ]
            ))[1], USDCToken.decimals));
        } else {
            usdBalance += Number(amount0)
        }

        if (token1Address != USDCToken.address) {
            usdBalance += Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                convertEthToWei(amount1, token1Decimal),
                [
                    token1Address,
                    USDCToken.address
                ]
            ))[1], USDCToken.decimals));
        } else {
            usdBalance += Number(amount1)
        }
        console.log("Pair:", usdBalance);
        totalUSD += usdBalance;
    }

    const poolsData = await StakePool.findAll({
        where: {
            isFinished: false,
        },
        order: [['createdAt', 'ASC']]
    });
    console.log(poolsData.length)
    for (let i = 0; i < poolsData.length; i++) {
        const stakingContract = new Contract(
            poolsData[i].address,
            (poolsData[i].isYoc ? YOCPool.abi : YOCPool.TokenABI),
            getProvider()
        )

        const tokenAddress = poolsData[i].tokenAddress;
        const tokenContact = new Contract(
            tokenAddress,
            TokenTemplate.abi,
            getProvider()
        );
        const stakeDecimal = poolsData[i].tokenDecimals;

        let totalLiquidity = convertWeiToEth(await tokenContact.balanceOf(poolsData[i].address), stakeDecimal);
        let stakedTotalUSDRes = 0;

        if (tokenAddress != USDCToken.address && Number(totalLiquidity)) {
            stakedTotalUSDRes = Number(convertWeiToEth((await swapRouterContract.getAmountsOut(
                convertEthToWei(totalLiquidity, stakeDecimal),
                [
                    tokenAddress,
                    USDCToken.address
                ]
            ))[1], USDCToken.decimals));
        } else {
            stakedTotalUSDRes = Number(totalLiquidity)
        }
        console.log('TOKEN: ', stakedTotalUSDRes);
        totalUSD += stakedTotalUSDRes;
    }

    return totalUSD;
}

module.exports = {
    storeYocPricePer20mins,
    storeTVLPer20mins
}