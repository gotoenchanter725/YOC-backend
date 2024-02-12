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

const getProvider = function () {
    // if (NETWORK.wss.indexOf("wss://") != -1) {
    // return getWebSocketProvider()
    // } else {
    return getJsonProvider();
    // }
}

const getJsonProvider = function () {
    // console.log('getJsonProvider', NETWORK.RPC_URL);
    const provider = new ethers.providers.JsonRpcProvider(NETWORK.RPC_URL);
    return provider;
}

const getWebSocketProvider = function () {
    // console.log('getWebSocketProvider', NETWORK.wss);
    const provider = new ethers.providers.WebSocketProvider(NETWORK.wss);
    return provider;
}

const nuanceToPercentage = (first, second) => {
    return (second - first) / first * 100;
}

module.exports = {
    delay,
    convertEthToWei,
    convertWeiToEth,
    getProvider,
    getJsonProvider,
    getWebSocketProvider,
    nuanceToPercentage
}