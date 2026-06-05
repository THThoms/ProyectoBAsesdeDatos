const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Auditoria = sequelize.define('AUDITORIA', {
  ID_AUD:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  FEC_HOR:    { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  ACC_AUD:    { type: DataTypes.STRING(20), allowNull: false },
  TAB_AUD:    { type: DataTypes.STRING(30), allowNull: false },
  ID_REG_AUD: { type: DataTypes.INTEGER, allowNull: false },
  DES_AUD:    { type: DataTypes.STRING(200) },
  IP_EQU:     { type: DataTypes.STRING(45) },
  ID_USU:     { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'AUDITORIA' });

module.exports = Auditoria;
