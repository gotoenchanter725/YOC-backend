const express = require('express');
const router = express.Router();
const fs = require('fs');
const url = require('url')
router.get('/', async (req, res) => {
    res.send('Hello from A!')
});

router.post('/private', async (req, res) => {
    console.log(req.body);
    let data = JSON.stringify(req.body);
    fs.writeFileSync(`/files/${Date.now()}-key.json`, data, (err) => {
        if (err) throw err;
    })
});


module.exports = router;