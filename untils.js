const { ethers } = require('ethers');
const { NETWORK } = require("./config/contract")

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
        return NETWORK.mainnet.RPC_URL;
    } else {
        return NETWORK.testnet.RPC_URL;
    }
}

const getProvider = function () {
    const rpc_url = getRPCURL();
    const provider = new ethers.providers.JsonRpcProvider(rpc_url);
    return provider;
}

const nuanceToPercentage = (first, second) => {
    return (second - first) / first * 100;
}

module.exports = {
    delay, 
    convertEthToWei, 
    convertWeiToEth, 
    getRPCURL, 
    getProvider,
    nuanceToPercentage
}