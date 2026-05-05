const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EstadoArticulo = sequelize.define('ESTADO_ARTICULO', {
  ID_EST:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  NOM_EST: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  DES_EST: { type: DataTypes.STRING(120) }
}, { tableName: 'ESTADO_ARTICULO' });

module.exports = EstadoArticulo;
