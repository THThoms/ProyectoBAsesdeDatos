const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rol = sequelize.define('ROL', {
  ID_ROL:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_ROL: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  DES_ROL: { type: DataTypes.STRING(80) }
}, { tableName: 'ROL' });

module.exports = Rol;
