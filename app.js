const express = require("express");
const cors = require("cors");
const logger = require('morgan');
require("dotenv").config();
const app = express();
app.use(logger('dev'));

const indexRouter = require('./routes');
const projectRouter = require('./routes/projectRouter');
const votingRouter = require('./routes/votingRouter');
const farmRouter = require('./routes/farmRouter');
const stakingRouter = require('./routes/stakingRouter');
var corsOptions = {
    origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.use('/api/', indexRouter);
app.use('/api/voting', votingRouter);
app.use('/api/project', projectRouter);
app.use('/api/farm', farmRouter);
app.use('/api/staking', stakingRouter);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});