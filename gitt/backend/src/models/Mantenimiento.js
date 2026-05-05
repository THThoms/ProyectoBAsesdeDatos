const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Mantenimiento = sequelize.define('MANTENIMIENTO', {
  ID_MAN:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  TIP_MAN: { type: DataTypes.STRING(20), allowNull: false },
  FEC_INI: { type: DataTypes.DATE,       allowNull: false },
  FEC_FIN: { type: DataTypes.DATE },
  DES_MAN: { type: DataTypes.STRING(200) },
  COS_MAN: { type: DataTypes.DECIMAL(10, 2) },
  PRO_TEC: { type: DataTypes.STRING(40) },
  RES_MAN: { type: DataTypes.STRING(30) },
  ID_ART:  { type: DataTypes.INTEGER, allowNull: false },
  ID_USU:  { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'MANTENIMIENTO' });

module.exports = Mantenimiento;
