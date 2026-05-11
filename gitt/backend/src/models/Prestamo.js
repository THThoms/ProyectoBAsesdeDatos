const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prestamo = sequelize.define('PRESTAMO', {
  ID_PRE:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  FEC_PRE:      { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  FEC_DEV_PRO:  { type: DataTypes.DATE,        allowNull: false },
  FEC_DEV_REAL: { type: DataTypes.DATE },
  EST_PRE:      { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'ACTIVO' },
  OBS_PRE:      { type: DataTypes.STRING(200) },
  ID_USU:       { type: DataTypes.INTEGER,     allowNull: false },
  ID_RESP:      { type: DataTypes.INTEGER,     allowNull: false }
}, { tableName: 'PRESTAMO' });

module.exports = Prestamo;
