const express = require("express");
const cors = require("cors");
const logger = require('morgan');
require("dotenv").config();
const app = express();
app.use(logger('dev'));

const db = require('./models');
// db.sequelize.sync({ force: true }).then(() => {
db.sequelize.sync({}).then(() => {
    console.log("Synced db.");
}).catch((err) => {
    console.log("Falied to sync db: " + err.message);
});

const indexRouter = require('./routes');
const projectRouter = require('./routes/projectRouter');
const votingRouter = require('./routes/votingRouter');
const farmRouter = require('./routes/farmRouter');
const stakingRouter = require('./routes/stakingRouter');
const chartRouter = require('./routes/chartRouter');
const currencyRouter = require('./routes/currencyRouter');
const liqudityRouter = require('./routes/liquidityRouter');
const tradeRouter = require('./routes/tradeRouter');
const adminCurrencyRouter = require('./routes/admin/currencyRouter');
const adminLiqudityRouter = require('./routes/admin/liquidityRouter');
const adminFarmRouter = require('./routes/admin/farmRouter');
const adminStakeRouter = require('./routes/admin/stakeRouter');

const { storeYocPricePerHour, storeTVLPerHour, monitorYUSD } = require("./controllers/chartController");
const { scanMonitorLiquidities } = require("./controllers/liquidityController");
const { scanMonitorFarms } = require("./controllers/farmController");
const { scanMonitorStakes } = require("./controllers/stakeController");
const { monitorProjectTrade } = require("./controllers/tradeController");
const { scanMonitorProjects } = require("./controllers/projectController");

var corsOptions = {
    origin: "*"
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
app.use('/api/trade', tradeRouter);
app.use('/api/stake', stakingRouter);
app.use('/api/chart', chartRouter);
app.use('/api/admin/currency', adminCurrencyRouter);
app.use('/api/admin/liquidity', adminLiqudityRouter);
app.use('/api/admin/farm', adminFarmRouter);
app.use('/api/admin/stake', adminStakeRouter);
app.use('/api/liquidity', liqudityRouter);
app.use('/api/currency', currencyRouter);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);

    // storeYocPricePerHour();
    // storeTVLPerHour();
    scanMonitorLiquidities();
    scanMonitorFarms();
    scanMonitorStakes();
    monitorYUSD();
    monitorProjectTrade();
    scanMonitorProjects();
});