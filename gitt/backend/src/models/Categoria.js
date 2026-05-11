const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('CATEGORIA', {
  ID_CAT:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_CAT: { type: DataTypes.STRING(25), allowNull: false, unique: true },
  DES_CAT: { type: DataTypes.STRING(120) }
}, { tableName: 'CATEGORIA' });

module.exports = Categoria;
