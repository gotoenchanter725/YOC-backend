const { Op } = require('sequelize');
const { TradeOrder, TradePrice, TradeTransaction, Project } = require('../models');
const { ProjectTrade, ProjectManager, YUSD, TokenTemplate } = require('../config/contracts');
const { getProvider, nuanceToPercentage, convertWeiToEth, delay } = require('../untils');
const { Contract } = require('ethers');

const monitorProjectTrade = async () => {
    console.log("<=== monitorProjectTradeContract ====>");
    const ProjectTradeContract = new Contract(
        ProjectTrade.address,
        ProjectTrade.abi,
        getProvider()
    );
    const YUSDContract = new Contract(
        YUSD.address,
        YUSD.abi,
        getProvider()
    );
    ProjectTradeContract.on("AddNewProjectToken", (pToken, timestamp) => {

    });

    ProjectTradeContract.on("SetPrice", async (pToken, price, timestamp) => {
        console.log(`<== monitorProjectTrade SetPrice: (${pToken}, ${price}, ${timestamp}) ==>`);
        const tradePrice = TradePrice.findOne({
            where: {
                timestamp: timestamp,
                ptokenAddress: pToken
            }
        });
        if (tradePrice) {
            console.log("<== monitorProjectTrade SetPrice: already saved ==>");
        } else {
            console.log("<== monitorProjectTrade SetPrice: new price detet ==>");
            const newTradePrice = await TradePrice.create({
                ptokenAddress: pToken,
                price: price,
                timestamp: timestamp
            })
            console.log("<== monitorProjectTrade SetPrice: new price saved ==>");
        }
    })

    ProjectTradeContract.on("OrderCreated", async (pToken, userAddress, orderId, amount, price, isBuy) => {
        console.log(`<== monitorProjectTrade OrderCreated: new order detect (${pToken}, ${userAddress}, ${orderId}, ${amount}, ${price}, ${isBuy}) ==>`);
        try {
            const newTradeOrder = await TradeOrder.create({
                orderId: orderId,
                ptokenAddress: pToken,
                userAddress: userAddress,
                price: price,
                totalAmount: amount,
                remainingAmount: amount,
                isBuy: isBuy,
                transactionIds: ""
            });
            console.log(`<== monitorProjectTrade OrderCreated: new order saved ==>`);
            // check the Ptoken and YUSD pool
            // let YUSDBalance = convertWeiToEth(await YUSD.balanceOf(ProjectTrade.address), YUSD.decimals);
            updatePtokenOfTradeProject(pToken);
            console.log(`<== monitorProjectTrade OrderCreated: updated project info ==>`)
        } catch (err) {
            console.log(`<== monitorProjectTrade OrderCreated: error ==>`);
        }
    });

    // ProjectTradeContract.on("TradeOrder", (pToken, userAddress, orderId) => {
    //     console.log(`<== monitorProjectTrade TradeOrder: (${pToken}, ${userAddress}, ${orderId}) ==>`);
    // });

    ProjectTradeContract.on("TradeTransaction", async (pToken, amount, price, transactionId, buyOwner, sellOwner, buyOrderId, sellOwnerId, timestamp) => {
        console.log(`<== monitorProjectTrade TradeTransaction: (${pToken}, ${amount}, ${price}, ${transactionId}, ${buyOwner}, ${sellOwner}, ${buyOrderId}, ${sellOwnerId}, ${timestamp}) ==>`);
        try {
            const newTradeTransaction = await TradeTransaction.create({
                transactionId: transactionId,
                amount: amount,
                ptokenAddress: pToken,
                price: price,
                buyOrderId: buyOrderId,
                sellOwnerId: sellOwnerId
            });
            // add transaction Id in order
            addTransactionByOrderId(buyOrderId, transactionId);
            addTransactionByOrderId(sellOwnerId, transactionId);
            // update full Ptoken and YUSD
            updatePtokenOfTradeProject(pToken);
            console.log(`<== monitorProjectTrade OrderCreated: new order saved ==>`);
        } catch (err) {
            console.log(`<== monitorProjectTrade OrderCreated: error ==>`);
        }
    });
}

const allTradeProject = async (req, res) => {
    try {
        let data = [];
        const projects = await Project.findAll({
            order: [['createdAt', 'ASC']]
        }, {
            where: {
                ptokenPoolAmount: "0"
            }
        })
        const currentDate = new Date(), sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 7);
        console.log(sevenDaysAgo);
        projects.forEach(async (project) => {
            if (Number(project.ptokenPoolAmount) == 0) return;
            // total: project.ptokenTotoalSupply
            // available: project.ptokenTotoalSupply - project.ptokenPoolAmount
            // in order: project.ptokenPoolAmount
            // YUSD value: project.YUSDTradePoolAmount
            // price: latest trade price => from price, frist price is the project fund section
            // YUSD Vale: total * price => project.ptokenTotoalSupply * price
            // 24h: nuance percentage for 24 hours
            // 7d: nuance percentage for 7 days
            // 24h Volume: total traded YUSD amount for 24 hours
            // Mkt Cap: project.ptokenTotoalSupply * price
            let pricesFor1d = await tradePriceBetweenDates(oneDayAgo, currentDate, project).average;
            let pricesFor7d = await tradePriceBetweenDates(sevenDaysAgo, currentDate, project).average;
            data.push({
                ...project,
                nauncePercentageFor1d: nuanceToPercentage(pricesFor1d),
                nauncePercentageFor7d: nuanceToPercentage(pricesFor7d),
                marketCap: project.ptokenTotalSupply * project.price,
                tradedYUSDFor24h: await totalTradedYUSDAmount(oneDayAgo, currentDate, project),
                prices: pricesFor7d.data
            })
        });
        await delay(3000);
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({ error: '' })
    }
}

const tradePriceBetweenDates = async (endDate, startDate, projectInfo, nuance = 1000 * 60 * 60 * 24) => {
    let data = [];
    const prices = await TradePrice.findAll({
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            },
            ptokenAddress: projectInfo.ptokenAddress
        }
    });
    let iterationDate = new Date(startDate);
    iterationDate.setHours(0, 0, 0, 0);
    let prevPrice = projectInfo.price;
    while (iterationDate <= endDate) {
        let pricesByIterationDate = prices.filter((price) => {
            return +iterationDate < +new Date(price.createdAt) && +new Date(price.createdAt) < +iterationDate + nuance
        })
        let averagePrice = 0;
        if (pricesByIterationDate.length) {
            averagePrice = pricesByIterationDate.reduce((prev, price) => prev + price.price, 0) / pricesByIterationDate.length;
        } else {
            averagePrice = prevPrice;
        }
        data.push({
            value: averagePrice,
            date: iterationDate
        })
        prevPrice = averagePrice;
        iterationDate = new Date(+iterationDate + nuance);
    }
    return {
        data: data,
        average: data.reduce((prev, p) => p.value + prev, 0) / data.length
    };
}

const totalTradedYUSDAmount = async (startDate, endDate, projectInfo) => {
    const transactions = await TradeTransaction.findAll({
        where: {
            ptokenAddress: projectInfo.ptokenAddress,
            [Op.between]: [startDate, endDate]
        }
    });
    return transactions.reduce((prev, transaction) => transaction.amount * transaction.price + prev, 0);
}

const updatePtokenOfTradeProject = async (pToken) => {
    const ptokenContract = new Contract(
        pToken,
        TokenTemplate.abi,
        getProvider()
    )
    const projectInfo = await Project.findOne({
        where: {
            ptokenAddress: pToken
        }
    });
    let ptokenBalance = convertWeiToEth(await ptokenContract.balanceOf(ProjectTrade.address), projectInfo.ptokenDecimals);
    await Project.update({
        ptokenPoolAmount: ptokenBalance,
        // YUSDTradePoolAmount: YUSDBalance
    }, {
        where: {
            ptokenAddress: pToken
        }
    });
}

const addTransactionByOrderId = async (orderId, transactionId) => {
    let buyOrder = await TradeOrder.findOne({
        where: {
            orderId: orderId
        }
    });
    let buyOrderTransactionIds = buyOrder.transactionIds.split(',');
    buyOrderTransactionIds.push(transactionId);
    await TradeOrder.update({
        transactionIds: buyOrderTransactionIds.join(',')
    })
}

const allTradeOrdersByAddress = async (req, res) => {
    const { address } = req.query;
    try {
        const data = await TradeOrder.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                }
            ],
            where: {
                userAddress: address
            },
            order: [['createdAt', 'ASC']],
        });
        await delay(3000);

        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({ error: '' })
    }
}

const tradedYUSDByAddress = async (req, res) => {
    try {
        const { address } = req.query;
        const orders = await TradeOrder.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                }
            ],
            where: {
                userAddress: address
            },
            order: [['createdAt', 'ASC']],
        });
        let totalYUSDBalance = 0;
        orders.forEach((order) => {
            if (order.isBuy && Number(order.remainingAmount) > 0) {
                totalYUSDBalance += Number(order.remainingAmount) * 1.0019;
            } else return;
        });
        res.status(200).json({
            status: true,
            value: totalYUSDBalance
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: false
        })
    }
}

const projectDetailByPtokenAddress = async (req, res) => {
    await delay(2000);
    try {
        const { ptokenAddress } = req.query;
        const project = await Project.findOne({
            where: {
                ptokenAddress: ptokenAddress
            }
        })

        const currentDate = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 7);
        let pricesFor1d = [];
        if (project) {
            pricesFor1d = tradePriceBetweenDates(currentDate, oneDayAgo, project);
        } else throw "No project";

        const orders = await TradeOrder.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                }
            ],
            where: {
                ptokenAddress: ptokenAddress
            },
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json({
            status: true,
            data: {
                project,
                pricesFor1d,
                orders
            }
        })
    } catch (err) {
        console.log(err);
        // res.status(500).json({
        //     status: false,
        // })

        res.status(200).json({
            status: true,
            data: {
                project: {},
                pricesFor1d: [],
                orders: []
            }
        })
    }
}

const pricesByPtokenAddress = async (req, res) => {
    try {
        const { period, ptokenAddress } = req.query;
        const project = await Project.findOne({
            where: {
                ptokenAddress: ptokenAddress
            }
        })
        let currentDate = new Date();
        let periodAgo = new Date(+currentDate - period);
        periodAgo.setHours(0, 0, 0, 0);
        if (project) {
            let prices = tradePriceBetweenDates(currentDate, periodAgo, project, period / 30)
            res.status(200).json({
                status: true,
                data: prices.data
            })
        } else throw "No project";
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: false
        })
    }
}

const allTransactionByOrderId = async (req, res) => {
    await delay(2000);
    try {
        const { orderId } = req.query;
        const order = await TradeOrder.findOne({
            where: {
                orderId: orderId
            }
        });
        if (order) {
            let transactionIds = order.transactionIds;
            let data = transactionIds.split(',').map(async (transactionId) => {
                return await TradeTransaction.TradeTransaction({
                    where: {
                        transactionId: transactionId
                    }
                })
            });
            res.status(200).json({
                status: true,
                data: data
            })
        } else throw "No project";
    } catch (err) {
        console.log(err)
        res.status(500).json({
            status: false
        })
    }
}

module.exports = {
    allTradeProject,
    allTradeOrdersByAddress,
    projectDetailByPtokenAddress,
    tradedYUSDByAddress,
    monitorProjectTrade,
    pricesByPtokenAddress,
    allTransactionByOrderId
}