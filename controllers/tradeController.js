const { Contract } = require('ethers');
const moment = require('moment');
const { Op, where } = require('sequelize');
const { TradeOrder, TradePrice, TradeTransaction, Project } = require('../models');
const { ProjectTrade, ProjectManager, YUSD, TokenTemplate } = require('../config/contracts');
const { getProvider, nuanceToPercentage, convertWeiToEth, delay } = require('../untils');

const oneDay = 1000 * 60 * 60 * 24;
const oneWeek = 1000 * 60 * 60 * 24 * 7;
const oneMonth = 1000 * 60 * 60 * 24 * 30;

const monitorProjectTrade = async () => {
    try {
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
            console.log(`<== monitorProjectTrade AddNewProjectToken: (${pToken}, ${timestamp}) ==>`)
        });

        ProjectTradeContract.on("SetPrice", async (pToken, price, timestamp) => {
            console.log(`<== monitorProjectTrade SetPrice: (${pToken}, ${price}, ${timestamp}) ==>`);
            const tradePrice = await TradePrice.findOne({
                where: {
                    timestamp: Number(timestamp),
                    ptokenAddress: {
                        [Op.like]: pToken.toLowerCase()
                    }
                }
            });
            if (tradePrice) {
                console.log("<== monitorProjectTrade SetPrice: already saved ==>");
            } else {
                console.log("<== monitorProjectTrade SetPrice: new price detet ==>");
                const newTradePrice = await TradePrice.create({
                    ptokenAddress: String(pToken),
                    price: convertWeiToEth(String(price), YUSD.decimals),
                    timestamp: String(timestamp)
                })
                console.log("<== monitorProjectTrade SetPrice: new price saved ==>",);
            }
        })

        ProjectTradeContract.on("OrderCreated", async (pToken, userAddress, orderId, amount, price, isBuy) => {
            console.log(`<== monitorProjectTrade OrderCreated: new order detect (${pToken}, ${userAddress}, ${orderId}, ${amount}, ${price}, ${isBuy}) ==>`);
            try {
                const projectInfo = await Project.findOne({
                    where: {
                        ptokenAddress: {
                            [Op.like]: String(pToken).toLowerCase()
                        }
                    }
                });
                const newTradeOrder = await TradeOrder.create({
                    orderId: Number(orderId),
                    ptokenAddress: String(pToken),
                    userAddress: String(userAddress),
                    price: String(convertWeiToEth(price, YUSD.decimals)),
                    totalAmount: String(convertWeiToEth(amount, projectInfo.ptokenDecimals)),
                    remainingAmount: String(convertWeiToEth(amount, projectInfo.ptokenDecimals)),
                    isBuy: Boolean(isBuy),
                    transactionIds: ""
                });
                console.log(`<== monitorProjectTrade OrderCreated: new order saved ==>`);
                // check the Ptoken and YUSD pool
                // let YUSDBalance = convertWeiToEth(await YUSD.balanceOf(ProjectTrade.address), YUSD.decimals);
                updatePtokenOfTradeProject(String(pToken));
                console.log(`<== monitorProjectTrade OrderCreated: updated project info ==>`)
            } catch (err) {
                console.log(`<== monitorProjectTrade OrderCreated: error ==>`, err);
            }
        });

        ProjectTradeContract.on("TradeOrder", async (pToken, userAddress, orderId) => {
            try {
                console.log(`<== monitorProjectTrade TradeOrder: (${pToken}, ${userAddress}, ${orderId}) ==>`);
                const projectInfo = await Project.findOne({
                    where: {
                        ptokenAddress: {
                            [Op.like]: pToken.toLowerCase()
                        }
                    }
                });
                const orderInfo = await ProjectTradeContract.orders(String(pToken), Number(orderId));
                const remainingAmount = convertWeiToEth(orderInfo.remainingAmount, projectInfo.ptokenDecimals);
                await TradeOrder.update({
                    remainingAmount: remainingAmount
                },
                    {
                        where: {
                            ptokenAddress: {
                                [Op.like]: String(pToken).toLowerCase()
                            },
                            orderId: Number(orderId)
                        }
                    }
                );
            } catch (error) {
                console.log(`<== monitorProjectTrade TradeOrder: error`, error);
            }
        });

        ProjectTradeContract.on("TradeTransaction", async (pToken, amount, price, transactionId, buyOwner, sellOwner, buyOrderId, sellOrderId, timestamp) => {
            console.log(`<== monitorProjectTrade TradeTransaction: (${pToken}, ${amount}, ${price}, ${transactionId}, ${buyOwner}, ${sellOwner}, ${buyOrderId}, ${sellOrderId}, ${timestamp}) ==>`);
            try {
                const projectInfo = await Project.findOne({
                    where: {
                        ptokenAddress: {
                            [Op.like]: pToken.toLowerCase()
                        }
                    }
                });
                const newTradeTransaction = await TradeTransaction.create({
                    transactionId: Number(transactionId),
                    amount: convertWeiToEth(String(amount), projectInfo.ptokenDecimals),
                    ptokenAddress: String(pToken),
                    price: convertWeiToEth(String(price), YUSD.decimals),
                    buyOrderId: String(buyOrderId),
                    sellOrderId: String(sellOrderId)
                });
                // add transaction Id in order
                addTransactionByOrderId(String(pToken), String(buyOrderId), String(transactionId));
                addTransactionByOrderId(String(pToken), String(sellOrderId), String(transactionId));
                // update full Ptoken and YUSD
                updatePtokenOfTradeProject(String(pToken));
                console.log(`<== monitorProjectTrade OrderCreated: new order saved ==>`);
            } catch (err) {
                console.log(`<== monitorProjectTrade OrderCreated: error ==>`);
            }
        });

        ProjectTradeContract.on("CancelOrder", async (pToken, orderId) => {
            try {
                console.log(`<== monitorProjectTrade CancelOrder: (${pToken}, ${orderId}) ==>`);
                await TradeOrder.update({
                    isCancelled: true
                }, {
                    where: {
                        ptokenAddress: {
                            [Op.like]: String(pToken).toLowerCase()
                        },
                        orderId: Number(orderId)
                    }
                })
                updatePtokenOfTradeProject(String(pToken));
            } catch (err) {
                console.log(`<== monitorProjectTrade CancelOrder Err: ${err} ==>`)
            }
        });

        ProjectTradeContract.on("RemoveOrder", async (pToken, orderId) => {
            try {
                console.log(`<== monitorProjectTrade RemoveOrder: (${pToken}, ${orderId}) ==>`);
                await TradeOrder.update({
                    isRemoved: true
                }, {
                    where: {
                        ptokenAddress: {
                            [Op.like]: String(pToken).toLowerCase()
                        },
                        orderId: Number(orderId)
                    }
                })
                updatePtokenOfTradeProject(String(pToken));
            } catch (err) {
                console.log(`<== monitorProjectTrade RemoveOrder Err: ${err} ==>`)
            }
        });
    } catch (err) {
        console.log('<== monitorProjectTrade: Error ==>', err)
    }
}

const allTradeProject = async (req, res) => {
    try {
        let { address } = req.query;
        let data = [];
        const projects = await Project.findAll({
            order: [['createdAt', 'ASC']]
        }, {
            where: {
                ptokenPoolAmount: "0.0"
            }
        })
        const currentDate = new Date(), sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        projects.forEach(async (project) => {
            if (Number(project.ptokenPoolAmount) > 0) return;
            // total: project.ptokenTotoalSupply
            // in order: project.ptokenTradeBalance by address
            // price: latest trade price => from price, frist price is the project fund section
            // YUSD Vale: total * price => project.ptokenTotoalSupply * price
            // 24h: nuance percentage for 24 hours
            // 7d: nuance percentage for 7 days
            // 24h Volume: total traded YUSD amount for 24 hours
            // Mkt Cap: project.ptokenTotoalSupply * price
            let pricesFor1d = await tradePriceBetweenDates(oneDayAgo, currentDate, project, oneDay / 30);
            let pricesFor7d = await tradePriceBetweenDates(sevenDaysAgo, currentDate, project, oneWeek / 30);
            data.push({
                data: {
                    ...project.dataValues,
                },
                inOrder: await tradePtokenBalanceByAddress(project.ptokenAddress, address),
                nauncePercentageFor1d: pricesFor1d.nuance,
                nauncePercentageFor7d: pricesFor7d.nuance,
                marketCap: project.ptokenSellAmount * pricesFor7d.data[pricesFor7d.data.length - 1].value,
                tradedYUSDFor24h: await totalTradedYUSDAmount(oneDayAgo, currentDate, project.ptokenAddress),
                prices: pricesFor7d.data,
                price: pricesFor7d.data[pricesFor7d.data.length - 1]
            })
        });
        await delay(3000);
        return res.status(200).json({
            data
        })
    } catch (err) {
        console.log('allTradeProject', err);
        return res.status(500).json({ error: '' })
    }
}

const tradePtokenBalanceByAddress = async (pToken, address) => {
    try {
        const orders = await TradeOrder.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                }
            ],
            where: {
                ptokenAddress: {
                    [Op.like]: pToken.toLowerCase()
                },
                userAddress: {
                    [Op.like]: address.toLowerCase()
                },
                isRemoved: false
            },
            order: [['createdAt', 'ASC']],
        });
        let totalYUSDBalance = 0;
        orders.forEach((order) => {
            if (order.isBuy == 0 && Number(order.remainingAmount) > 0 && Number(order.isCancelled) == 0) {
                totalYUSDBalance += Number(order.remainingAmount);
            } else return;
        });
        return totalYUSDBalance;
    } catch (err) {
        console.log('tradePtokenBalanceByAddress', err)
        return 0;
    }
}

const tradePriceBetweenDates = async (startDate, endDate, projectInfo, nuance = 1000 * 60 * 60 * 24) => {
    try {
        let data = [];
        const parsedStartDate = moment(startDate, 'YYYY-MM-DD HH:mm:ss').toDate();
        const parsedEndDate = moment(endDate, 'YYYY-MM-DD HH:mm:ss').toDate();
        let prevPrice = 0;
        const pricesBeforePeriod = await TradePrice.findOne({
            where: {
                createdAt: {
                    [Op.lt]: parsedStartDate
                },
                ptokenAddress: {
                    [Op.like]: projectInfo.ptokenAddress.toLowerCase()
                }
            },
            order: [['createdAt', 'DESC']]
        })
        if (pricesBeforePeriod) {
            prevPrice = pricesBeforePeriod.price;
        }
        const prices = await TradePrice.findAll({
            where: {
                createdAt: {
                    [Op.between]: [parsedStartDate, parsedEndDate]
                },
                ptokenAddress: {
                    [Op.like]: projectInfo.ptokenAddress.toLowerCase()
                }
            }
        });
        let iterationDate = new Date(startDate);
        while (iterationDate < endDate) {
            let pricesByIterationDate = [...prices.filter((price) => {
                return +iterationDate < +new Date(price.createdAt) && +new Date(price.createdAt) < +iterationDate + nuance
            })]
            let averagePrice = 0;
            if (pricesByIterationDate.length) {
                averagePrice = pricesByIterationDate.reduce((prev, price) => +prev + +price.price, 0) / pricesByIterationDate.length;
            } else {
                if (+new Date(iterationDate) < +new Date(projectInfo.createdAt)) {
                    prevPrice = 0;
                }
                averagePrice = prevPrice;
            }
            data.push({
                value: averagePrice,
                date: iterationDate
            })
            prevPrice = averagePrice;
            iterationDate = new Date(+iterationDate + nuance);
        }
        if (prices.length == 0) {
            const latestPrice = await TradePrice.findOne({
                where: {
                    ptokenAddress: {
                        [Op.like]: projectInfo.ptokenAddress.toLowerCase()
                    }
                },
                order: [['createdAt', 'DESC']]
            })
            data.push({
                value: latestPrice.price,
                date: endDate
            })
        } else {
            data.push({
                value: prices[prices.length - 1].price,
                date: endDate
            })
        }
        let startPrice = data.length > 1 ? data[0].value : 0;
        // if (startPrice == 0) {
        //     startPrice = projectInfo.ptokenPrice
        // }
        let endPrice = data.length ? data[data.length - 1].value : 0;
        console.log(startPrice, endPrice);
        return {
            nuance: nuanceToPercentage(startPrice, endPrice),
            data: data,
            average: data.reduce((prev, p) => Number(p.value) + Number(prev), 0) / data.length
        };
    } catch (err) {
        console.log('tradePriceBetweenDates: ', err)
    }
}

const checkPriceIsRaise = async (projectInfo) => {
    try {
        const latestPrice = await TradePrice.findOne({
            where: {
                ptokenAddress: {
                    [Op.like]: projectInfo.ptokenAddress.toLowerCase()
                }
            },
            order: [['createdAt', 'DESC']]
        })
        const preLatestPrice = await TradePrice.findOne({
            where: {
                ptokenAddress: {
                    [Op.like]: projectInfo.ptokenAddress.toLowerCase()
                },
                price: {
                    [Op.ne]: latestPrice.price
                }
            },
            order: [['createdAt', 'DESC']]
        })
        if (preLatestPrice) {
            return Number(latestPrice.price) > Number(preLatestPrice.price)
        } else return true;
    } catch (error) {
        console.log('checkPriceIsRaise', error);
        return true;
    }
}

const totalTradedYUSDAmount = async (startDate, endDate, ptokenAddress) => {
    try {
        console.log('totalTradedYUSDAmount', startDate, endDate, ptokenAddress);
        const transactions = await TradeTransaction.findAll({
            where: {
                ptokenAddress: {
                    [Op.like]: ptokenAddress.toLowerCase()
                },
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
        return transactions.reduce((prev, transaction) => transaction.amount * transaction.price + prev, 0);
    } catch (error) {
        console.log('totalTradedYUSDAmount', error.message)
    }
}

const updatePtokenOfTradeProject = async (pToken) => {
    try {
        const ptokenContract = new Contract(
            pToken,
            TokenTemplate.abi,
            getProvider()
        )
        const YUSDContract = new Contract(
            YUSD.address,
            YUSD.abi,
            getProvider()
        )
        const projectInfo = await Project.findOne({
            where: {
                ptokenAddress: {
                    [Op.like]: pToken.toLowerCase()
                }
            }
        });
        let ptokenBalance = convertWeiToEth(await ptokenContract.balanceOf(ProjectTrade.address), projectInfo.ptokenDecimals);
        let YUSDTradePoolAmount = convertWeiToEth(await YUSDContract.balanceOf(ProjectTrade.address), YUSD.decimals);
        await Project.update({
            ptokenTradeBalance: ptokenBalance,
            YUSDTradePoolAmount: YUSDTradePoolAmount
        }, {
            where: {
                ptokenAddress: {
                    [Op.like]: pToken.toLowerCase()
                }
            }
        });
    } catch (error) {
        console.log('updatePtokenOfTradeProject', error.message)
    }
}

const addTransactionByOrderId = async (ptokenAddress, orderId, transactionId) => {
    console.log(`<== addTransactionByOrderId: ${orderId}, ${transactionId}`);
    try {
        let order = await TradeOrder.findOne({
            where: {
                orderId: orderId
            }
        });
        let orderTransactionIds = order.transactionIds.split(',');
        orderTransactionIds.push(transactionId);
        await TradeOrder.update({
            transactionIds: orderTransactionIds.join(',')
        }, {
            where: {
                orderId: orderId,
                ptokenAddress: {
                    [Op.like]: ptokenAddress.toLowerCase()
                }
            }
        })
    } catch (error) {
        console.log('addTransactionByOrderId', error.message)
    }
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
                userAddress: {
                    [Op.like]: address.toLowerCase()
                },
                isRemoved: false
            },
            order: [['createdAt', 'ASC']],
        });
        for (let i = 0; i < data.length; i++) {
            let item = data[i], transactionData;
            if (item.isBuy) {
                transactionData = await TradeTransaction.findAll({
                    where: {
                        ptokenAddress: {
                            [Op.like]: item.ptokenAddress.toLowerCase(),
                        },
                        buyOrderId: item.orderId
                    }
                })
            } else {
                transactionData = await TradeTransaction.findAll({
                    where: {
                        ptokenAddress: {
                            [Op.like]: item.ptokenAddress.toLowerCase()
                        },
                        sellOrderId: item.orderId
                    }
                })
            }
            let averagePrice = 0;
            if (transactionData.length) averagePrice = transactionData.reduce((total, item) => total + Number(item.price), 0) / transactionData.length;
            data[i] = {
                ...item.dataValues,
                averagePrice: averagePrice,
                transactions: [
                    ...transactionData
                ]
            };
        }
        await delay(3000);

        return res.status(200).json({
            data
        })
    } catch (err) {
        console.log(`allTradeOrdersByAddress:`, err);
        return res.status(500).json({ error: err })
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
                userAddress: {
                    [Op.like]: address.toLowerCase()
                },
                isRemoved: false
            },
            order: [['createdAt', 'ASC']],
        });
        let totalYUSDBalance = 0;
        orders.forEach((order) => {
            if (order.isBuy && Number(order.remainingAmount) > 0 && Number(order.isCancelled) == 0) {
                totalYUSDBalance += Number(order.remainingAmount) * 1.0019;
            } else return;
        });
        res.status(200).json({
            status: true,
            value: totalYUSDBalance
        })
    } catch (err) {
        console.log('tradedYUSDByAddress: ', err);
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
                ptokenAddress: {
                    [Op.like]: ptokenAddress.toLowerCase()
                }
            }
        })

        const currentDate = new Date();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        let pricesFor1d = [], isRaise = true;
        if (project) {
            pricesFor1d = await tradePriceBetweenDates(oneDayAgo, currentDate, project, oneDay / 30);
            isRaise = await checkPriceIsRaise(project);
        } else throw "No project";

        let latestPrice = project.ptokenPrice;
        if (pricesFor1d && pricesFor1d.data) {
            latestPrice = pricesFor1d.data[pricesFor1d.data.length - 1].value;
        }

        const orders = await TradeOrder.findAll({
            include: [
                {
                    model: Project,
                    as: 'project',
                }
            ],
            where: {
                ptokenAddress: {
                    [Op.like]: ptokenAddress.toLowerCase()
                },
                isRemoved: false
            },
            order: [['createdAt', 'ASC']],
        });

        res.status(200).json({
            status: true,
            data: {
                project,
                pricesFor1d,
                orders,
                latestPrice,
                isRaise
            }
        })
    } catch (err) {
        console.log('projectDetailByPtokenAddress', err);
        res.status(500).json({
            status: false,
        })
    }
}

const pricesByPtokenAddress = async (req, res) => {
    try {
        const { period, ptokenAddress } = req.query;
        const project = await Project.findOne({
            where: {
                ptokenAddress: {
                    [Op.like]: ptokenAddress.toLowerCase()
                }
            }
        })
        let currentDate = new Date();
        let periodAgo = new Date(+currentDate - period);
        if (project) {
            let prices = await tradePriceBetweenDates(periodAgo, currentDate, project, period / 30)
            res.status(200).json({
                status: true,
                data: prices.data
            })
        } else throw "No project";
    } catch (err) {
        console.log('pricesByPtokenAddress', err)
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
        console.log('allTransactionByOrderId', err)
        res.status(500).json({
            status: false
        })
    }
}

const volumeByPtokenAddressForPeriod = async (req, res) => {
    try {
        const { period, ptokenAddress } = req.query;
        let currentDate = new Date(), periodAgo = new Date();
        periodAgo = new Date(Number(periodAgo) - period);
        let tradedYUSDForPeriod = await totalTradedYUSDAmount(periodAgo, currentDate, ptokenAddress);
        res.status(200).json({
            status: true,
            value: tradedYUSDForPeriod
        })
    } catch (err) {
        console.log('pricesByPtokenAddress', err)
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
    volumeByPtokenAddressForPeriod,
    allTransactionByOrderId
}