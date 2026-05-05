const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Articulo = sequelize.define('ARTICULO', {
  ID_ART:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  COD_BAR: { type: DataTypes.STRING(30), unique: true },
  COD_INS: { type: DataTypes.STRING(30), unique: true },
  NOM_ART: { type: DataTypes.STRING(60),  allowNull: false },
  DES_ART: { type: DataTypes.STRING(200) },
  MAR_ART: { type: DataTypes.STRING(30) },
  MOD_ART: { type: DataTypes.STRING(30) },
  SER_ART: { type: DataTypes.STRING(40) },
  FEC_REG: { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  IMG_ART: { type: DataTypes.STRING(120) },
  ACT_ART: { type: DataTypes.CHAR(1),     allowNull: false, defaultValue: 'S' },
  ID_CAT:  { type: DataTypes.INTEGER,     allowNull: false },
  ID_EST:  { type: DataTypes.INTEGER,     allowNull: false },
  ID_UBI:  { type: DataTypes.INTEGER,     allowNull: false },
  ID_RESP: { type: DataTypes.INTEGER }
}, { tableName: 'ARTICULO' });

module.exports = Articulo;
