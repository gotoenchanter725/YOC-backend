const express = require('express');
const router = express.Router();

const { Project } = require('../models');
const { VotingQuery } = require('../models');
const { VotingDetail } = require('../models');

// Create New Project
router.post('/create', async (req, res) => {
    try {
        let current = await Project.findOne({
            where: {
                projectTitle: req.body.projectTitle
            }
        })
        if (!current) {
            const project = await Project.create(req.body);
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

router.delete('/project', async (req, res) => {
    try {
        // await Project.desttoy({
        //     where: {

        //     }
        // })
    } catch (err) {
        
    }
});


module.exports = router;