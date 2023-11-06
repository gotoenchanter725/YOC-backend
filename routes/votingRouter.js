const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const { VotingQuery } = require('../models');
const { VotingDetail } = require('../models');
// Voting Query Creation
router.post('/create', async (req, res) => {
    try {
        const votingquery = await VotingQuery.create(req.body);
        return res.status(201).json({
            votingquery,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});
// Get Voting Poll Data
router.get('/projectTitle/:projectTitle', async (req, res) => {
    try {
        const votingQueryDetail = await VotingQuery.findAll({
            where: {
                projectTitle: req.params.projectTitle
            },
            order: [['endDate', 'ASC']]
        });
        return res.status(200).json({ votingQueryDetail });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});
// Get Certain User Voting Info
router.get('/projectTitle/:projectTitle/accountAddress/:userAddress', async (req, res) => {
    try {
        const validVotingQuery = await VotingQuery.findOne({
            where: {
                projectTitle: req.params.projectTitle,
                startDate: {
                    [Op.lt]: new Date()
                },
                endDate: {
                    [Op.gt]: new Date()
                }
            },
            include: [
                {
                    model: VotingDetail,
                    where: {
                        userAddress: req.params.userAddress
                    }
                }
            ]
        });
        return res.status(200).json({ userVotingStatus: validVotingQuery });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

// Save Voting Status
router.post('/saveUserStatus', async (req, res) => {
    try {
        const userVotingStatus = await VotingDetail.findOne({
            where: {
                queryId: req.body.queryId,
                userAddress: req.body.userAddress,
            }
        });
        if (!userVotingStatus) {
            const userStatus = await VotingDetail.create(req.body);
            return res.status(201).json({
                userStatus
            });
        } else {
            return res.json({
                statusText: "Exsited"
            });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});

// Get Voting Result
router.get('/queryId/:id', async (req, res) => {
    try {
        const votingResult = await VotingDetail.findAll({
            where: {
                queryId: req.params.id,
            },
            include: [
                {
                    model: VotingQuery,
                }
            ]
        });

        return res.status(200).json({ votingResult: votingResult });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});

module.exports = router;