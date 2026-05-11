const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Departamento = sequelize.define('DEPARTAMENTO', {
  ID_DEP:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_DEP: { type: DataTypes.STRING(40), allowNull: false },
  DES_DEP: { type: DataTypes.STRING(120) }
}, { tableName: 'DEPARTAMENTO' });

module.exports = Departamento;
