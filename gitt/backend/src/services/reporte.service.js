const { Op, fn, col, literal } = require('sequelize');
const {
  Articulo, Categoria, EstadoArticulo, Ubicacion, Prestamo,
  DetallePrestamo, Mantenimiento, Responsable, sequelize
} = require('../models');
const { ESTADOS_PRESTAMO } = require('../utils/constants');

async function dashboard() {
  const totalArticulos = await Articulo.count({ where: { ACT_ART: 'S' } });
  const prestamosActivos = await Prestamo.count({ where: { EST_PRE: ESTADOS_PRESTAMO.ACTIVO } });
  const prestamosVencidos = await Prestamo.count({
    where: {
      EST_PRE: { [Op.in]: [ESTADOS_PRESTAMO.ACTIVO, ESTADOS_PRESTAMO.VENCIDO] },
      FEC_DEV_PRO: { [Op.lt]: new Date() }
    }
  });
  const mantenimientosCurso = await Mantenimiento.count({ where: { FEC_FIN: null } });

  const articulosPorCategoria = await Articulo.findAll({
    attributes: [
      [col('categoria.NOM_CAT'), 'categoria'],
      [fn('COUNT', col('ARTICULO.ID_ART')), 'total']
    ],
    where: { ACT_ART: 'S' },
    include: [{ model: Categoria, as: 'categoria', attributes: [] }],
    group: ['categoria.NOM_CAT'],
    raw: true
  });

  const prestamosPorMes = await Prestamo.findAll({
    attributes: [
      [fn('TO_CHAR', col('FEC_PRE'), 'YYYY-MM'), 'mes'],
      [fn('COUNT', col('ID_PRE')), 'total']
    ],
    where: { FEC_PRE: { [Op.gte]: literal("ADD_MONTHS(SYSDATE,-6)") } },
    group: [fn('TO_CHAR', col('FEC_PRE'), 'YYYY-MM')],
    order: [[fn('TO_CHAR', col('FEC_PRE'), 'YYYY-MM'), 'ASC']],
    raw: true
  });

  const ultimosPrestamos = await Prestamo.findAll({
    include: [{ model: Responsable, as: 'responsable' }],
    order: [['FEC_PRE', 'DESC']], limit: 5
  });

  return {
    totalArticulos,
    prestamosActivos,
    prestamosVencidos,
    mantenimientosCurso,
    articulosPorCategoria,
    prestamosPorMes,
    ultimosPrestamos
  };
}

async function inventario() {
  return Articulo.findAll({
    where: { ACT_ART: 'S' },
    include: [
      { model: Categoria,      as: 'categoria' },
      { model: EstadoArticulo, as: 'estado' },
      { model: Ubicacion,      as: 'ubicacion' },
      { model: Responsable,    as: 'responsable' }
    ],
    order: [['NOM_ART', 'ASC']]
  });
}

async function prestamosActivos() {
  return Prestamo.findAll({
    where: { EST_PRE: ESTADOS_PRESTAMO.ACTIVO },
    include: [
      { model: Responsable, as: 'responsable' },
      { model: DetallePrestamo, as: 'detalles', include: [{ model: Articulo, as: 'articulo' }] }
    ],
    order: [['FEC_DEV_PRO', 'ASC']]
  });
}

async function mantenimientos() {
  return Mantenimiento.findAll({
    include: [{ model: Articulo, as: 'articulo' }],
    order: [['FEC_INI', 'DESC']]
  });
}

module.exports = { dashboard, inventario, prestamosActivos, mantenimientos };
