const { ethers } = require('ethers');

const delay = (ms) => {
    new Promise((resolve) => setTimeout(resolve, ms));
}

const convertEthToWei = function (eth, decimals) {
    return ethers.utils.parseUnits(String(Number(eth).toFixed(decimals)), decimals);
}

const convertWeiToEth = function (wei, decimals) {
    return ethers.utils.formatUnits(wei, decimals);
}

module.exports = {
    delay, 
    convertEthToWei, 
    convertWeiToEth
}