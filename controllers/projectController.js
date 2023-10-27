const { Project } = require('../models/Project');
const { TokenTemplate, Project: projectAbi, ProjectManager, ProjectTrade, PRIVATE_KEY } = require("../config/contracts");
const { getProvider, delay, convertWeiToEth, convertEthToWei } = require('../untils');
const { Contract } = require('ethers');


// Create New Project
const create = async (req, res) => {
    try {
        let data = req.body;
        let current = await Project.findOne({
            where: {
                projectTitle: data.projectTitle
            }
        })
        if (!current) {
            const project = await Project.create({
                projectTitle: data.projectTitle,
                iconUrl: data.iconUrl,
                address: data.address,
                ptokenAddress: data.ptokenAddress,
                ptokenDecimals: data.decimals, 
                ptokenTotalSupply: data.totalSupuply,
                ptokenSymbol: data.projectTitle,
                ptokenSellAmount: data.sellAmount,
                ptokenPoolAmount: data.sellAmount,
                ptokenPrice: data.price
            });
            monitorProject(project);

            
            const signer = new ethers.Wallet(PRIVATE_KEY, getProvider());
            let ProjectTradeContract = new Contract(
                ProjectTrade.address,
                ProjectTrade.abi,
                signer
            )
            // when create new project, set the price in trade project
            let tx = await ProjectTradeContract.setPriceByAdmin(data.address, data.price);
            await tx.wait();
            return res.status(201).json({
                project,
            });
        } else {
            return res.status(204).json({
                state: "The project is already existed"
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
};

const scanMonitorProjects = async () => {
    const projects = await Project.findAll({});
    const projectManagerContract = new Contract(
        ProjectManager.address,
        ProjectManager.abi,
        getProvider()
    )
    console.log(`<== scanMonitorProjects and monitor project manager ==>`)
    projects.forEach(pItem => {
        monitorProject(pItem);
    });
    projectManagerContract.on('DeployedNewProject', (userAddress, contractAddress, ptokenAddress) => {
        console.log(`<== scanMonitorProjects: DeployedNewProject (${userAddress}, ${contractAddress}, ${ptokenAddress}) ==>`);
    })
}

const monitorProject = (projectInfo) => {
    const projectContract = new Contract(
        projectInfo.address, 
        projectAbi.abi,
        getProvider()
    );
    const ptokenContract = new Contract(
        projectInfo.ptokenAddress,
        TokenTemplate.abi,
        getProvider()
    )
    projectContract.on('participate', async (_pToken, _YUSDAmount, _pTokenAmount) => {
        console.log(`<== monitorProject: participate (${_pToken}, ${_YUSDAmount}, ${_pTokenAmount}) ==>`);
        var currentPollAmount = convertWeiToEth(await ptokenContract.balanceOf(projectInfo.address), projectInfo.ptokenAddress);
        console.log(`<== monitorProject: participate: previous pull amount ${projectInfo.ptokenPoolAmount} ==>`);
        await Project.update({
            ptokenPoolAmount: currentPollAmount
        }, {
            where: {
                address: projectInfo.address
            }
        });
        console.log(`<== monitorProject: participate: updated pull amount ${currentPollAmount} ==>`);
    })
    projectContract.on('Refund', async (_pToken, _YUSDAmount, _pTokenAmount) => {
        console.log(`<== monitorProject: Refund (${_pToken}, ${_YUSDAmount}, ${_pTokenAmount}) ==>`);
        var currentPollAmount = convertWeiToEth(await ptokenContract.balanceOf(projectInfo.address), projectInfo.ptokenAddress);
        console.log(`<== monitorProject: Refund: previous pull amount ${projectInfo.ptokenPoolAmount} ==>`);
        await Project.update({
            ptokenPoolAmount: currentPollAmount
        }, {
            where: {
                address: projectInfo.address
            }
        });
        console.log(`<== monitorProject: Refund: updated pull amount ${currentPollAmount} ==>`);
    })
}

module.exports = {
    create,
    scanMonitorProjects
}