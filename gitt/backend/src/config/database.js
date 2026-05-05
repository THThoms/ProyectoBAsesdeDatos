const { Sequelize } = require('sequelize');
const oracledb = require('oracledb');
const logger = require('../utils/logger');

oracledb.fetchAsString = [oracledb.CLOB];

const sequelize = new Sequelize(
  process.env.ORACLE_USER,
  process.env.ORACLE_PASSWORD,
  {
    dialect: 'oracle',
    dialectModule: require('sequelize-oracle-reborn').default || require('sequelize'),
    dialectOptions: {
      connectString: process.env.ORACLE_CONNECT_STRING
    },
    pool: {
      max: parseInt(process.env.ORACLE_POOL_MAX || '10', 10),
      min: parseInt(process.env.ORACLE_POOL_MIN || '2', 10),
      acquire: 60000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development'
      ? (msg) => logger.debug(msg)
      : false,
    define: {
      freezeTableName: true,
      timestamps: false,
      underscored: false
    }
  }
);

async function connect() {
  try {
    await sequelize.authenticate();
    logger.info('Conexion a Oracle establecida correctamente');
  } catch (error) {
    logger.error('Error al conectar a Oracle:', error.message);
    throw error;
  }
}

module.exports = { sequelize, connect };
