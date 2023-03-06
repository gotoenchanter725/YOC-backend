const ProjectManageABI = require("../contracts/ProjectManage.sol/ProjectManage.json");
const ProjectABI = require("../contracts/Project.sol/Project.json");
const ProjectDetailABI = require("../contracts/ProjectDetail.sol/ProjectDetail.json");
const TokenTemplateABI = require("../contracts/TokenTemplate.sol/TokenTemplate.json");
const USDCTokenABI = require("../contracts/USDC.sol/USDC.json");
const YOCABI = require("../contracts/YOC.sol/YOC.json");
const YOCSwapRouterAPI = require("../contracts/YocswapRouter.sol/YocswapRouter.json");
const YOCSwapFactoryABI = require("../contracts/YocswapFactory.sol/YocswapFactory.json");
const YOCPairABI = require("../contracts/YocswapFactory.sol/YocswapPair.json");
const YOCFarmABI = require("../contracts/YocFarming.sol/YOCMasterChef.json");
const YOCStakingABI = require("../contracts/YocStaking.sol/YocStaking.json");
const TokenStakingABI = require("../contracts/TokenStaking.sol/TokenStaking.json");

const AdminWalletAddress = process.env.AdminWalletAddress + "";

const ProjectManager = {
    ...ProjectManageABI, 
    address: process.env.ProjectManagerAddress + ""
};

const Project = {
    ...ProjectABI
}

const ProjectDetail = {
    ...ProjectDetailABI, 
    address: process.env.ProjectDetailAddress + ""
}

const TokenTemplate = TokenTemplateABI;

const WETH = process.env.WETH + "";

const YOC = {
    address: process.env.YOCAddress + "", 
    decimals: 18, 
    symbol: "YOC", 
    name: "YOC-FoundersCoin", 
    ...YOCABI
}

const USDCToken = {
    ...USDCTokenABI, 
    decimals: 6, 
    symbol: "USDC", 
    name: "USDC-FoundersCoin", 
    address: process.env.USDCAddress + ""
}

const YOCSwapFactory = {
    ...YOCSwapFactoryABI, 
    address: process.env.YOCSwapFactoryAddress + ""
}

const YOCSwapRouter = {
    ...YOCSwapRouterAPI, 
    address: process.env.YOCSwapRouterAddress + ""
}

const YOCPair = {
    ...YOCPairABI, 
}

const YOCFarm = {
    ...YOCFarmABI, 
    address: process.env.YOCFarmAddress + ""
}

const YOCPool = {
    ...YOCStakingABI, 
    TokenABI: TokenStakingABI.abi, 
}

module.exports = {
    AdminWalletAddress, 
    ProjectManager, 
    Project, 
    ProjectDetail, 
    TokenTemplate, 
    WETH, 
    USDCToken, 
    YOC, 
    YOCSwapRouter, 
    YOCSwapFactory, 
    YOCFarm, 
    YOCPool,
    YOCPair
}