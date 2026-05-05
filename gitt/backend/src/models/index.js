const { sequelize } = require('../config/database');

const Rol             = require('./Rol');
const Usuario         = require('./Usuario');
const Departamento    = require('./Departamento');
const Ubicacion       = require('./Ubicacion');
const Categoria       = require('./Categoria');
const EstadoArticulo  = require('./EstadoArticulo');
const Responsable     = require('./Responsable');
const Articulo        = require('./Articulo');
const Prestamo        = require('./Prestamo');
const DetallePrestamo = require('./DetallePrestamo');
const Mantenimiento   = require('./Mantenimiento');
const Movimiento      = require('./Movimiento');
const Notificacion    = require('./Notificacion');
const Auditoria       = require('./Auditoria');

// Rol - Usuario
Rol.hasMany(Usuario,    { foreignKey: 'ID_ROL', as: 'usuarios' });
Usuario.belongsTo(Rol,  { foreignKey: 'ID_ROL', as: 'rol' });

// Departamento - Ubicacion
Departamento.hasMany(Ubicacion,    { foreignKey: 'ID_DEP', as: 'ubicaciones' });
Ubicacion.belongsTo(Departamento,  { foreignKey: 'ID_DEP', as: 'departamento' });

// Articulo - Categoria/Estado/Ubicacion/Responsable
Categoria.hasMany(Articulo,        { foreignKey: 'ID_CAT', as: 'articulos' });
Articulo.belongsTo(Categoria,      { foreignKey: 'ID_CAT', as: 'categoria' });

EstadoArticulo.hasMany(Articulo,   { foreignKey: 'ID_EST', as: 'articulos' });
Articulo.belongsTo(EstadoArticulo, { foreignKey: 'ID_EST', as: 'estado' });

Ubicacion.hasMany(Articulo,        { foreignKey: 'ID_UBI', as: 'articulos' });
Articulo.belongsTo(Ubicacion,      { foreignKey: 'ID_UBI', as: 'ubicacion' });

Responsable.hasMany(Articulo,      { foreignKey: 'ID_RESP', as: 'articulos' });
Articulo.belongsTo(Responsable,    { foreignKey: 'ID_RESP', as: 'responsable' });

// Prestamo - Usuario/Responsable
Usuario.hasMany(Prestamo,          { foreignKey: 'ID_USU',  as: 'prestamos' });
Prestamo.belongsTo(Usuario,        { foreignKey: 'ID_USU',  as: 'usuario' });

Responsable.hasMany(Prestamo,      { foreignKey: 'ID_RESP', as: 'prestamos' });
Prestamo.belongsTo(Responsable,    { foreignKey: 'ID_RESP', as: 'responsable' });

// Prestamo - DetallePrestamo - Articulo
Prestamo.hasMany(DetallePrestamo,        { foreignKey: 'ID_PRE', as: 'detalles' });
DetallePrestamo.belongsTo(Prestamo,      { foreignKey: 'ID_PRE', as: 'prestamo' });

Articulo.hasMany(DetallePrestamo,        { foreignKey: 'ID_ART', as: 'detallesPrestamo' });
DetallePrestamo.belongsTo(Articulo,      { foreignKey: 'ID_ART', as: 'articulo' });

// Mantenimiento
Articulo.hasMany(Mantenimiento,    { foreignKey: 'ID_ART', as: 'mantenimientos' });
Mantenimiento.belongsTo(Articulo,  { foreignKey: 'ID_ART', as: 'articulo' });

Usuario.hasMany(Mantenimiento,     { foreignKey: 'ID_USU', as: 'mantenimientos' });
Mantenimiento.belongsTo(Usuario,   { foreignKey: 'ID_USU', as: 'usuario' });

// Movimiento
Articulo.hasMany(Movimiento,       { foreignKey: 'ID_ART', as: 'movimientos' });
Movimiento.belongsTo(Articulo,     { foreignKey: 'ID_ART', as: 'articulo' });

Usuario.hasMany(Movimiento,        { foreignKey: 'ID_USU', as: 'movimientos' });
Movimiento.belongsTo(Usuario,      { foreignKey: 'ID_USU', as: 'usuario' });

Movimiento.belongsTo(Ubicacion,        { foreignKey: 'ID_UBI_ORI', as: 'ubicacionOrigen' });
Movimiento.belongsTo(Ubicacion,        { foreignKey: 'ID_UBI_DES', as: 'ubicacionDestino' });
Movimiento.belongsTo(EstadoArticulo,   { foreignKey: 'ID_EST_ANT', as: 'estadoAnterior' });
Movimiento.belongsTo(EstadoArticulo,   { foreignKey: 'ID_EST_NUE', as: 'estadoNuevo' });

// Notificacion
Prestamo.hasMany(Notificacion,         { foreignKey: 'ID_PRE',      as: 'notificaciones' });
Notificacion.belongsTo(Prestamo,       { foreignKey: 'ID_PRE',      as: 'prestamo' });
Usuario.hasMany(Notificacion,          { foreignKey: 'ID_USU_DEST', as: 'notificaciones' });
Notificacion.belongsTo(Usuario,        { foreignKey: 'ID_USU_DEST', as: 'destinatario' });

// Auditoria
Usuario.hasMany(Auditoria,         { foreignKey: 'ID_USU', as: 'auditorias' });
Auditoria.belongsTo(Usuario,       { foreignKey: 'ID_USU', as: 'usuario' });

module.exports = {
  sequelize,
  Rol, Usuario, Departamento, Ubicacion, Categoria, EstadoArticulo,
  Responsable, Articulo, Prestamo, DetallePrestamo, Mantenimiento,
  Movimiento, Notificacion, Auditoria
};
