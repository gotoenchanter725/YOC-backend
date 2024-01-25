const { Contract, ethers } = require('ethers');
const { Op } = require('sequelize');
const { Project, TradePrice } = require('../models');
const { TokenTemplate, Project: projectAbi, ProjectManager, ProjectTrade, PRIVATE_KEY, YUSD } = require("../config/contracts");
const { getProvider, delay, convertWeiToEth, convertEthToWei } = require('../untils');


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
                ptokenPrice: 1 / Number(data.price),
                endDate: new Date(Number(data.endDate)),
                multiplier: multiplier,
                projectWallet: date.projectWallet,
            });
            monitorProject(project);

            // const newTradePrice = await TradePrice.create({
            //     ptokenAddress: data.ptokenAddress,
            //     price: data.price,
            //     timestamp: String(+new Date())
            // })

            const signer = new ethers.Wallet(PRIVATE_KEY, getProvider());
            let ProjectTradeContract = new Contract(
                ProjectTrade.address,
                ProjectTrade.abi,
                signer
            )
            // when create new project, set the price in trade project
            console.log('price::', convertEthToWei(1 / data.price, YUSD.decimals));
            let tx = await ProjectTradeContract.setPriceByAdmin(data.ptokenAddress, convertEthToWei(1 / data.price, YUSD.decimals), {
                gasLimit: 75000
            });
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
        console.log(`<== Project create: error ${error} ==>`)
        return res.status(500).json({ error: error.message })
    }
};

const scanMonitorProjects = async () => {
    try {
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
    } catch (err) {
        console.log('<== scanMonitorProjects: Error ==>', err.message);
    }
}

const monitorProject = (projectInfo) => {
    try {
        console.log(`<== monitorProject: start ${projectInfo.address} ==>`);
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
        projectContract.on('Participated', async (_pToken, _YUSDAmount, _pTokenAmount) => {
            console.log(`<== monitorProject: Participated (${_pToken}, ${_YUSDAmount}, ${_pTokenAmount}) ==>`);
            var currentPollAmount = convertWeiToEth(await ptokenContract.balanceOf(projectInfo.address), projectInfo.ptokenDecimals);
            console.log(`<== monitorProject: Participated: previous pull amount ${projectInfo.ptokenPoolAmount} ==>`);
            await Project.update({
                ptokenPoolAmount: currentPollAmount
            }, {
                where: {
                    address: {
                        [Op.like]: projectInfo.address
                    }
                }
            });
            console.log(`<== monitorProject: Participated: updated pull amount ${currentPollAmount} ==>`);
        })
        projectContract.on('Refund', async (_pToken, _YUSDAmount, _pTokenAmount) => {
            console.log(`<== monitorProject: Refund (${_pToken}, ${_YUSDAmount}, ${_pTokenAmount}) ==>`);
            var currentPollAmount = convertWeiToEth(await ptokenContract.balanceOf(projectInfo.address), projectInfo.ptokenDecimals);
            console.log(`<== monitorProject: Refund: previous pull amount ${projectInfo.ptokenPoolAmount} ==>`);
            await Project.update({
                ptokenPoolAmount: currentPollAmount
            }, {
                where: {
                    address: {
                        [Op.like]: projectInfo.address
                    }
                }
            });
            console.log(`<== monitorProject: Refund: updated pull amount ${currentPollAmount} ==>`);
        })
    } catch (err) {
        console.log("<=== monitorProject: Error ===>", err.message)
    }
}

const getTime = (req, res) => {
    console.log(new Date())
    // Get the current date
    const date = new Date();

    // Get the timezone offset in minutes
    const timezoneOffsetInMinutes = date.getTimezoneOffset();

    // Convert the offset to hours and minutes
    const timezoneOffsetInHours = Math.abs(timezoneOffsetInMinutes) / 60;
    const timezoneOffsetHours = Math.floor(timezoneOffsetInHours);
    const timezoneOffsetMinutes = Math.abs(timezoneOffsetInMinutes) % 60;

    // Determine the sign (to represent ahead or behind UTC)
    const sign = timezoneOffsetInMinutes > 0 ? '-' : '+';

    // Create the formatted timezone string
    const timezoneString = `UTC${sign}${timezoneOffsetHours.toString().padStart(2, '0')}:${timezoneOffsetMinutes.toString().padStart(2, '0')}`;

    console.log(timezoneString);

    return res.status(200).json({
        status: true,
        data: {
            timezone: timezoneString,
            time: Date.now(),
            value: new Date()
        },
        message: "server time"
    });
}

const getDetails = async (req, res) => {
    let data = req.query;
    try {
        let project = await Project.findOne({
            where: {
                ptokenAddress: {
                    [Op.like]: data.ptokenAddress
                }
            }
        })
        res.status(200).json({
            state: true,
            data: project
        })
    } catch (error) {
        console.log('getDetails', error);
        return res.status(500).json({ error: error.message })
    }
}

module.exports = {
    create,
    scanMonitorProjects,
    getDetails,
    getTime
}