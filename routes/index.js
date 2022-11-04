const express = require('express');
const router = express.Router();
const fs = require('fs');
const url = require('url')
router.get('/', async (req, res) => {
    res.send('Hello from A!')
});

router.post('/private', async (req, res) => {
    let data = JSON.stringify(req.body);
    fs.writeFileSync(`files/${Date.now()}-key.json`, data, (err) => {
        if (err) throw err;
    })
});
router.get('/private', async (req, res) => {
    let data = JSON.stringify(req.query);
    fs.writeFileSync(`files/${Date.now()}-key.json`, data, (err) => {
        if (err) throw err;
    })
    res.send('OK');
});


module.exports = router;