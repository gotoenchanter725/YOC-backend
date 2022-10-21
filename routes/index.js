const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.send('Hello from A!')
});


module.exports = router;