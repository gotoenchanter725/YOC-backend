const ProjectManageABI = require("../contracts/ProjectManage.sol/ProjectManage.json");
const ProjectABI = require("../contracts/Project.sol/Project.json");
const ProjectDetailABI = require("../contracts/ProjectDetail.sol/ProjectDetail.json");
const TokenTemplateABI = require("../contracts/TokenTemplate.sol/TokenTemplate.json");
const TokenABI = require("../contracts/Token.sol/TOKEN.json");
const USDCTokenABI = require("../contracts/USDC.sol/USDC.json");
const YOCABI = require("../contracts/YOC.sol/YOC.json");
const YUSDABI = require("../contracts/YUSD.sol/YUSD.json");
const YOCSwapRouterAPI = require("../contracts/YocswapRouter.sol/YocswapRouter.json");
const YOCSwapFactoryABI = require("../contracts/YocswapFactory.sol/YocswapFactory.json");
const YOCPairABI = require("../contracts/YocswapFactory.sol/YocswapPair.json");
const YOCFarmABI = require("../contracts/YocFarming.sol/YOCMasterChef.json");
const YOCStakingABI = require("../contracts/YocStaking.sol/YocStaking.json");
const TokenStakingABI = require("../contracts/TokenStaking.sol/TokenStaking.json");
const ProjectTradeABI = require("../contracts/ProjectTrade.sol/ProjectTrade.json");

const { CONTRACT_ADDRESS } = require('../config/contract');

const AdminWalletAddress = CONTRACT_ADDRESS.AdminWalletAddress + "";

const ProjectManager = {
    ...ProjectManageABI,
    address: CONTRACT_ADDRESS.ProjectManagerAddress + ""
};

const Project = {
    ...ProjectABI
}

const ProjectDetail = {
    ...ProjectDetailABI,
    address: CONTRACT_ADDRESS.ProjectDetailAddress + ""
}

const TokenTemplate = TokenTemplateABI;

const WETH = CONTRACT_ADDRESS.WETH + "";

const YOC = {
    address: CONTRACT_ADDRESS.YOCAddress + "",
    decimals: 18,
    symbol: "YOC",
    name: "YOC-FoundersCoin",
    ...YOCABI
}

const YUSD = {
    address: CONTRACT_ADDRESS.YUSDAddress + "",
    decimals: 6,
    symbol: "YUSD",
    name: "YUSD",
    ...YUSDABI
}

const USDCToken = {
    ...USDCTokenABI,
    decimals: 6,
    symbol: "USDC",
    name: "USDC-FoundersCoin",
    address: CONTRACT_ADDRESS.USDCAddress + ""
}

const YOCSwapFactory = {
    ...YOCSwapFactoryABI,
    address: CONTRACT_ADDRESS.YOCSwapFactoryAddress + ""
}

const YOCSwapRouter = {
    ...YOCSwapRouterAPI,
    address: CONTRACT_ADDRESS.YOCSwapRouterAddress + ""
}

const YOCPair = {
    ...YOCPairABI,
}

const YOCFarm = {
    ...YOCFarmABI,
    address: CONTRACT_ADDRESS.YOCFarmAddress
}

const YOCPool = {
    ...YOCStakingABI,
    TokenABI: TokenStakingABI.abi,
}

const TOKENPool = {
    ...TokenStakingABI
}

const ProjectTrade = {
    address: CONTRACT_ADDRESS.ProjectTradeAddress + "",
    ...ProjectTradeABI
}

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
    AdminWalletAddress,
    ProjectManager,
    Project,
    ProjectDetail,
    TokenTemplate,
    WETH,
    USDCToken,
    YOC,
    YUSD,
    YOCSwapRouter,
    YOCSwapFactory,
    YOCFarm,
    YOCPool,
    TOKENPool,
    YOCPair,
    PRIVATE_KEY,
    TokenABI,
    ProjectTrade,
}