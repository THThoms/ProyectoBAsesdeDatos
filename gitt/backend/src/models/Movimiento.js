const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Movimiento = sequelize.define('MOVIMIENTO', {
  ID_MOV:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  FEC_MOV:    { type: DataTypes.DATE,       allowNull: false, defaultValue: DataTypes.NOW },
  TIP_MOV:    { type: DataTypes.STRING(20), allowNull: false },
  DES_MOV:    { type: DataTypes.STRING(200) },
  ID_UBI_ORI: { type: DataTypes.INTEGER },
  ID_UBI_DES: { type: DataTypes.INTEGER },
  ID_EST_ANT: { type: DataTypes.INTEGER },
  ID_EST_NUE: { type: DataTypes.INTEGER },
  ID_ART:     { type: DataTypes.INTEGER, allowNull: false },
  ID_USU:     { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'MOVIMIENTO' });

module.exports = Movimiento;
