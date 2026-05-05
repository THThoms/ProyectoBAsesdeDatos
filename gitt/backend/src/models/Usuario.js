const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('USUARIO', {
  ID_USU:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  NOM_USU: { type: DataTypes.STRING(20),  allowNull: false },
  APE_USU: { type: DataTypes.STRING(20),  allowNull: false },
  COR_USU: { type: DataTypes.STRING(40),  allowNull: false, unique: true },
  CLA_USU: { type: DataTypes.STRING(100), allowNull: false },
  EST_USU: { type: DataTypes.STRING(15),  allowNull: false, defaultValue: 'ACTIVO' },
  ID_ROL:  { type: DataTypes.INTEGER,     allowNull: false }
}, {
  tableName: 'USUARIO',
  defaultScope: { attributes: { exclude: ['CLA_USU'] } },
  scopes: { withPassword: { attributes: { include: ['CLA_USU'] } } }
});

module.exports = Usuario;
