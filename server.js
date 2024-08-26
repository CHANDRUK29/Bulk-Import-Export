const express = require("express");
const cors = require('cors');
require('dotenv').config();
const logger = require("./config/logger.config");
const app = express();
require("./db").connectToMongo();
require('./db').connectToPostgres();
require('./models/postgres/user.model')
require('./db').syncDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.status(200).json({ message: 'Server is healthy', pid: process.pid, uptime: process.uptime() }));

// mongoose routes
app.use('/mongoose/user', require("./routes/mongoose/user.routes"));
app.use('/postgres/user', require("./routes/postgres/user.routes"));

const PORT = process.env.PORT || 4400;
app.listen(PORT, () => {
  logger.info(`server is listening on PORT ${PORT}`)
})