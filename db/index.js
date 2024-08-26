const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const logger = require("../config/logger.config");

class DBConnector {
  constructor() {
    this.MONGO_DB_URI = process.env.MONGO_DB_URI;
    this.PG_DB_URI = process.env.PG_DB_URI;
    this.SEQUELIZE_OPTS = { benchmark: Boolean(+process.env.PG_BENCHMARK), logging: (...msg) => logger.sqlLog(msg) };
    this.pgConn = new Sequelize(this.PG_DB_URI, this.SEQUELIZE_OPTS);
    this.MONGO_RETRY_COUNT = 0;
    this.MONGO_RETRY_LIMIT = 3;
    this.POSTGRES_RETRY_COUNT = 0;
    this.POSTGRES_RETRY_LIMIT = 3;
    this.RETRY_TIMEOUT = 5 * 1000;
  }

  handleDBConnectionError(db, error) {
    switch (db) {
      case 'mongo':
        if (this.MONGO_RETRY_COUNT < this.MONGO_RETRY_LIMIT) {
          logger.error("MongoDB connection ERROR", error);
          this.MONGO_RETRY_COUNT += 1
          setTimeout(() => {
            logger.info("Retrying....")
            this.connectToMongo();
          }, this.RETRY_TIMEOUT);
        } else {
          logger.error('MongoDb connection Error', error);
          logger.info('Retry Limit Exceeded. Teerminating the Process...')
          process.exit(0);
        }
        break;

      case 'postgres':
        if (this.POSTGRES_RETRY_COUNT < this.POSTGRES_RETRY_LIMIT) {
          logger.error('Postgres connection error', error);
          this.POSTGRES_RETRY_COUNT += 1;
          setTimeout(() => {
            logger.info('Retrying...');
            this.connectToPostgres();
          }, this.RETRY_TIMEOUT);
        } else {
          logger.error('Postgres connection error', error);
          logger.info('Retry Limit Exceeded. Terminating process');
          process.exit(0);
        }
        break;

      default:
        break;
    }
  }

  async connectToMongo() {
    try {
      mongoose.connect(this.MONGO_DB_URI).catch((error) => {
        console.log(error.message)
        this.handleDBConnectionError('mongo', error)
      });
      mongoose.connection
        .on('open', () => logger.log('Connected to MongoDb'))
        .on('close', () => logger.log('Disconnected from Mongo'))
    } catch (error) {
      console.log(error.message)
      this.handleDBConnectionError('mongo', error)
    }
  }

  async connectToPostgres() {
    this.pgConn
      .authenticate({ logging: false })
      .then(() => logger.log('Connected to Postgres'))
      .catch((error) => {
        this.handleDBConnectionError('postgres', error);
      });
  }

  async syncDatabase() {
    this.pgConn
      .sync({ alter: true, logging: false })
      .then(() => logger.log('Database Synced'))
      .catch((error) => {
        logger.error('Database Sychronization Error', error.message, error.sql);
        process.exit(0);
      });
  }
}

const db = new DBConnector();

module.exports = db;