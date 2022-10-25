const express = require('express');
const router = express.Router();

const { Project } = require('../models');
const { VotingQuery } = require('../models');
const { VotingDetail } = require('../models');

// Create New Project
router.post('/create', async (req, res) => {
    try {
        const project = await Project.create(req.body);
        return res.status(201).json({
            project,
        });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
});
// Get Project Detail Data
router.get('/project/:id', async (req, res) => {
    try {
        const projectDetail = await Project.findOne({
            where: req.params
        });
        return res.status(200).json({ projectDetail });
    } catch (error) {
        return res.status(500).send(error.message);
    }
});


module.exports = router;