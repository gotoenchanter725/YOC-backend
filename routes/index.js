const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Hello from A!')
});
router.get('/private', async (req, res) => {
    console.log(req.params)
});


module.exports = router;