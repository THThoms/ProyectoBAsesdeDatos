const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ubicacion = sequelize.define('UBICACION', {
  ID_UBI:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  NOM_UBI: { type: DataTypes.STRING(40), allowNull: false },
  TIP_UBI: { type: DataTypes.STRING(20), allowNull: false },
  DES_UBI: { type: DataTypes.STRING(120) },
  ID_DEP:  { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'UBICACION' });

module.exports = Ubicacion;
