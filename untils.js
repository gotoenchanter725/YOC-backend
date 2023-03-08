const { ethers } = require('ethers');

const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const convertEthToWei = function (eth, decimals) {
    return ethers.utils.parseUnits(String(Number(eth).toFixed(decimals)), decimals);
}

const convertWeiToEth = function (wei, decimals) {
    return ethers.utils.formatUnits(wei, decimals);
}

const getRPCURL = function () {
    if (process.env.NODE_ENV == 'production') {
        return process.env.NET_WORK == "ETH" ? "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" : "https://bsc-dataseed1.ninicoin.io/"
    } else {
        return process.env.NET_WORK == "ETH" ? "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" : "https://data-seed-prebsc-1-s3.binance.org:8545/"
    }
}

const getProvider = function () {
    const rpc_url = getRPCURL();
    const provider = new ethers.providers.JsonRpcProvider(rpc_url);
    return provider;
}

module.exports = {
    delay, 
    convertEthToWei, 
    convertWeiToEth, 
    getRPCURL, 
    getProvider
}