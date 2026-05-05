const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notificacion = sequelize.define('NOTIFICACION', {
  ID_NOT:      { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: false },
  ASU_NOT:     { type: DataTypes.STRING(80),  allowNull: false },
  MEN_NOT:     { type: DataTypes.STRING(300), allowNull: false },
  FEC_GEN:     { type: DataTypes.DATE,        allowNull: false, defaultValue: DataTypes.NOW },
  FEC_ENV:     { type: DataTypes.DATE },
  EST_NOT:     { type: DataTypes.STRING(20),  allowNull: false, defaultValue: 'PENDIENTE' },
  TIP_NOT:     { type: DataTypes.STRING(30),  allowNull: false },
  ID_PRE:      { type: DataTypes.INTEGER },
  ID_USU_DEST: { type: DataTypes.INTEGER }
}, { tableName: 'NOTIFICACION' });

module.exports = Notificacion;
