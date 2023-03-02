const { delay, convertWeiToEth, convertEthToWei, getProvider } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { Prices } = require('../models');
const { YOCSwapRouter, YOC, USDCToken } = require("../config/contracts");
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
            console.log(i + 1, +yPrice);
            t_prices.push(+yPrice + Number(Math.random().toFixed(3)) * 10);
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
        const newPrice = await Prices.create({
            high: _.max(t_prices),
            low: _.min(t_prices),
            from: t_prices[0],
            to: t_prices[t_prices.length - 1],
            price: t_prices.reduce((a, b) => a + b, 0) / t_prices.length,

            fromDate: format('yyyy-MM-dd hh:mm:ss', fromDate),
            toDate: format('yyyy-MM-dd hh:mm:ss', new Date()),
            datetime: format('yyyy-MM-dd hh:mm:ss', fromDate),
        });
        await delay(1000 * 1);
    }
}

module.exports = {
    storeYocPricePer20mins
}