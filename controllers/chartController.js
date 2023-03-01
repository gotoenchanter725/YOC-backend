const { delay } = require('../untils');
const { Contract, BigNumber, constants, utils, ethers } = require('ethers');
const { Prices } = require('../models');

const storeYocPricePer20mins = async () => {
    let swapContract = new Contract(
        YOCSwapRouter.address,
        YOCSwapRouter.abi,
        rpc_provider_basic
    )

    while (true) {
        await delay(1000 * 60 * 10);
        const newPrice = await Prices.create({
            price: '', 
            datetime: '', 
            createAt: ''
        });
    }
}

module.exports = {
    storeYocPricePer20mins
}