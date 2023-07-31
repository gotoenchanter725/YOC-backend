const ETH_NETWORK = {
    mainnet: {
        RPC_URL: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        CHAIN_ID: 1
    },
    testnet: {
        // RPC_URL: "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        // CHAIN_ID: 5
        RPC_URL: "https://eth-sepolia.g.alchemy.com/v2/9XxUB2Hodsix6mDB_6uE4U-Ap6tg4c5c",
        CHAIN_ID: 11155111
    }
}

const ETH_CONTRACT_ADDRESS = {
    AdminWalletAddress: "0x5141383723037FBd3818dAEcb7d4C5DF1Dc8c6B1",
    ProjectManagerAddress: "0x003F3Aa4CA6faA5518C1E938430E4308fCD77255",
    ProjectDetailAddress: "0x50e63304436B5b417cd909a55EAD3B29D4969aFb",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
    USDCAddress: "0x7A48A177d4C3cF6e2f5b06b70E4Cb732c910c482",
    YOCAddress: "0x199361BF6c9c6CCD960eb47D2fc400f8fD42D13e",
    YOCSwapFactoryAddress: "0x05d3F326d2DffCd9F8C21F781B882C5a16DbEbD3",
    YOCSwapRouterAddress: "0x201f24DbAa44Ab23cDC9D7488AFf3D6526671527",
    YOCFarmAddress: "0x8Cae5b8b3E1b7f41e472B8e6559241ec0E165FC8",
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