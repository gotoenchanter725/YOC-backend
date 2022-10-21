const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const indexRouter = require('./routes');
const votingRouter = require('./routes/votingRouter');
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

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});