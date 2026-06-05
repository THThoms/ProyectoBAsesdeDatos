const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetallePrestamo = sequelize.define('DETALLE_PRESTAMO', {
  ID_DET_PRE:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_PRE:      { type: DataTypes.INTEGER, allowNull: false },
  ID_ART:      { type: DataTypes.INTEGER, allowNull: false },
  EST_ENT:     { type: DataTypes.STRING(30) },
  EST_DEV:     { type: DataTypes.STRING(30) },
  OBS_DET_PRE: { type: DataTypes.STRING(200) }
}, { tableName: 'DETALLE_PRESTAMO' });

module.exports = DetallePrestamo;
