const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Responsable = sequelize.define('RESPONSABLE', {
  ID_RESP:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_RESP: { type: DataTypes.STRING(30), allowNull: false },
  APE_RESP: { type: DataTypes.STRING(30), allowNull: false },
  TIP_RESP: { type: DataTypes.STRING(20), allowNull: false },
  COR_RESP: { type: DataTypes.STRING(60) },
  TEL_RESP: { type: DataTypes.STRING(15) }
}, { tableName: 'RESPONSABLE' });

module.exports = Responsable;
