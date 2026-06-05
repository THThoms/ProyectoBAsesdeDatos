const { Op } = require('sequelize');
const {
  Articulo, Categoria, EstadoArticulo, Ubicacion, Responsable,
  Movimiento, Mantenimiento, sequelize
} = require('../models');
const { ESTADOS_ARTICULO } = require('../utils/constants');

const includeCatalogos = [
  { model: Categoria,      as: 'categoria' },
  { model: EstadoArticulo, as: 'estado' },
  { model: Ubicacion,      as: 'ubicacion' },
  { model: Responsable,    as: 'responsable' }
];

async function listar({ page, limit, offset }, filtros = {}) {
  const where = { ACT_ART: 'S' };
  if (filtros.search) {
    where[Op.or] = [
      { NOM_ART: { [Op.like]: `%${filtros.search}%` } },
      { COD_INS: { [Op.like]: `%${filtros.search}%` } },
      { COD_BAR: { [Op.like]: `%${filtros.search}%` } },
      { MAR_ART: { [Op.like]: `%${filtros.search}%` } }
    ];
  }
  if (filtros.categoria) where.ID_CAT = filtros.categoria;
  if (filtros.estado)    where.ID_EST = filtros.estado;
  if (filtros.ubicacion) where.ID_UBI = filtros.ubicacion;
  if (filtros.responsable) where.ID_RESP = filtros.responsable;

  const { rows, count } = await Articulo.findAndCountAll({
    where, include: includeCatalogos, limit, offset, order: [['ID_ART', 'DESC']]
  });
  return { rows, total: count, page, limit };
}

async function obtener(id) {
  return Articulo.findByPk(id, { include: includeCatalogos });
}

async function crear(data, idUsu) {
  return sequelize.transaction(async (t) => {
    const articulo = await Articulo.create({
      ...data, FEC_REG: data.FEC_REG || new Date(), ACT_ART: 'S'
    }, { transaction: t });

    await Movimiento.create({
      TIP_MOV:    'REGISTRO',
      DES_MOV:    'Registro inicial del articulo',
      ID_UBI_DES: articulo.ID_UBI,
      ID_EST_NUE: articulo.ID_EST,
      ID_ART:     articulo.ID_ART,
      ID_USU:     idUsu
    }, { transaction: t });
    return articulo;
  });
}

async function actualizar(id, data, idUsu) {
  return sequelize.transaction(async (t) => {
    const articulo = await Articulo.findByPk(id, { transaction: t });
    if (!articulo) throw Object.assign(new Error('Articulo no encontrado'), { statusCode: 404 });

    const ubiAnt = articulo.ID_UBI, estAnt = articulo.ID_EST;
    await articulo.update(data, { transaction: t });

    if (data.ID_UBI && data.ID_UBI !== ubiAnt) {
      await Movimiento.create({
        TIP_MOV: 'TRASLADO', DES_MOV: 'Cambio de ubicacion',
        ID_UBI_ORI: ubiAnt, ID_UBI_DES: data.ID_UBI,
        ID_ART: id, ID_USU: idUsu
      }, { transaction: t });
    }
    if (data.ID_EST && data.ID_EST !== estAnt) {
      await Movimiento.create({
        TIP_MOV: 'TRASLADO', DES_MOV: 'Cambio de estado',
        ID_EST_ANT: estAnt, ID_EST_NUE: data.ID_EST,
        ID_ART: id, ID_USU: idUsu
      }, { transaction: t });
    }
    return articulo;
  });
}

async function eliminarLogico(id) {
  const articulo = await Articulo.findByPk(id);
  if (!articulo) throw Object.assign(new Error('Articulo no encontrado'), { statusCode: 404 });
  articulo.ACT_ART = 'N';
  articulo.ID_EST = ESTADOS_ARTICULO.DADO_DE_BAJA;
  await articulo.save();
  return articulo;
}

async function historial(id) {
  return Movimiento.findAll({
    where: { ID_ART: id },
    include: [
      { model: Ubicacion,      as: 'ubicacionOrigen' },
      { model: Ubicacion,      as: 'ubicacionDestino' },
      { model: EstadoArticulo, as: 'estadoAnterior' },
      { model: EstadoArticulo, as: 'estadoNuevo' }
    ],
    order: [['FEC_MOV', 'DESC']]
  });
}

async function mantenimientos(id) {
  return Mantenimiento.findAll({ where: { ID_ART: id }, order: [['FEC_INI', 'DESC']] });
}

module.exports = { listar, obtener, crear, actualizar, eliminarLogico, historial, mantenimientos };
