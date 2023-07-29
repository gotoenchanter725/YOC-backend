const ETH_NETWORK = {
    mainnet: {
        RPC_URL: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        CHAIN_ID: 1
    },
    testnet: {
        // RPC_URL: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        // CHAIN_ID: 5
        RPC_URL: "https://sepolia.infura.io/v3/48b7b4cf9a7b4b5ca79c2413f2f0de2e",
        CHAIN_ID: 11155111
    }
}

const ETH_CONTRACT_ADDRESS = {
    AdminWalletAddress: "0x5141383723037FBd3818dAEcb7d4C5DF1Dc8c6B1",
    ProjectManagerAddress: "0xc263f50d949C5C3df3452c74b18c790481cA4D70",
    ProjectDetailAddress: "0x04Ab64A6479EA7b0817FFC8753401C2144fc76bA",
    WETH: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    YOCAddress: "0x116Ca60ACCCf9dd0b892046D549e7A1Ed4f7dbaA",
    USDCAddress: "0xc03Fa8445d32258FC2BF5fB31033089B324F727e",
    YOCSwapFactoryAddress: "0xD948A6FE7D109EB16CD48b5d3907f30e456A9f8b",
    YOCSwapRouterAddress: "0xeDFd6e4F2F4F14D82af295174570A4eC4EC864b1",
    YOCFarmAddress: "0x5e519Ba6576719072639CfdDd802bf6891Cd7dd8",
}

const BNB_NETWORK = {
    mainnet: {
        RPC_URL: "https://bsc-dataseed1.binance.org/",
        CHAIN_ID: 56
    },
    testnet: {
        RPC_URL: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        CHAIN_ID: 97
    }
}

const BNB_CONTRACT_ADDRESS = {
    AdminWalletAddress: "0x5141383723037FBd3818dAEcb7d4C5DF1Dc8c6B1",
    ProjectManagerAddress: "0xe56cfAaddfd7022577dEE71087A6152526999996",
    ProjectDetailAddress: "0xAb7a5363Bdf7174b6Cb17321bD2Ca8027bc9856B",
    WETH: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    YOCAddress: "0xA414d690f8e3596d1b99D80A6d811b97BB04a69B",
    USDCAddress: "0xcd81e5b921F9450685899a1B824E1D67a325b733",
    YOCSwapFactoryAddress: "0x5a33cEdBadC9a6Ee11220204F3c22c54B8DD00eA",
    YOCSwapRouterAddress: "0x7b4857d080D395E7816C13274b65Ef67d7dbebd5",
    YOCFarmAddress: "0x0b3CCeFe2014d81B8987a48aacD891CbBD3C7f94",
}

const NETWORK = process.env.NET_WORK === "ETH" ? ETH_NETWORK : BNB_NETWORK;
const CONTRACT_ADDRESS = process.env.NET_WORK === "ETH" ? ETH_CONTRACT_ADDRESS : BNB_CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    NETWORK,
    CONTRACT_ADDRESS,
    PRIVATE_KEY
}