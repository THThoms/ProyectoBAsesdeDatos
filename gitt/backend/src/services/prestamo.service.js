const { Op } = require('sequelize');
const {
  Prestamo, DetallePrestamo, Articulo, Movimiento, Notificacion,
  Usuario, Responsable, sequelize
} = require('../models');
const { ESTADOS_ARTICULO, ESTADOS_PRESTAMO, TIPOS_NOTIFICACION } = require('../utils/constants');

const includePrestamo = [
  { model: Usuario,     as: 'usuario',     attributes: ['ID_USU','NOM_USU','APE_USU','COR_USU'] },
  { model: Responsable, as: 'responsable' },
  {
    model: DetallePrestamo, as: 'detalles',
    include: [{ model: Articulo, as: 'articulo' }]
  }
];

async function listar({ page, limit, offset }, filtros = {}) {
  const where = {};
  if (filtros.estado)      where.EST_PRE = filtros.estado;
  if (filtros.responsable) where.ID_RESP = filtros.responsable;
  if (filtros.desde && filtros.hasta) {
    where.FEC_PRE = { [Op.between]: [filtros.desde, filtros.hasta] };
  }

  const { rows, count } = await Prestamo.findAndCountAll({
    where, include: includePrestamo, limit, offset,
    order: [['FEC_PRE', 'DESC']], distinct: true
  });
  return { rows, total: count, page, limit };
}

async function obtener(id) {
  return Prestamo.findByPk(id, { include: includePrestamo });
}

async function crearPrestamo(data, idUsu) {
  return sequelize.transaction(async (t) => {
    const articulosIds = data.articulos.map(a => a.ID_ART);
    const articulos = await Articulo.findAll({
      where: { ID_ART: { [Op.in]: articulosIds }, ACT_ART: 'S' }, transaction: t
    });
    if (articulos.length !== articulosIds.length) {
      throw Object.assign(new Error('Uno o mas articulos no existen o estan inactivos'), { statusCode: 400 });
    }
    const noDisponibles = articulos.filter(a => a.ID_EST !== ESTADOS_ARTICULO.DISPONIBLE);
    if (noDisponibles.length > 0) {
      throw Object.assign(
        new Error(`Articulos no disponibles: ${noDisponibles.map(a => a.NOM_ART).join(', ')}`),
        { statusCode: 400 }
      );
    }

    const prestamo = await Prestamo.create({
      FEC_PRE:     data.FEC_PRE || new Date(),
      FEC_DEV_PRO: data.FEC_DEV_PRO,
      EST_PRE:     ESTADOS_PRESTAMO.ACTIVO,
      OBS_PRE:     data.OBS_PRE,
      ID_USU:      idUsu,
      ID_RESP:     data.ID_RESP
    }, { transaction: t });

    for (const item of data.articulos) {
      await DetallePrestamo.create({
        ID_PRE:      prestamo.ID_PRE,
        ID_ART:      item.ID_ART,
        EST_ENT:     item.EST_ENT || 'BUENO',
        OBS_DET_PRE: item.OBS_DET_PRE
      }, { transaction: t });

      const art = articulos.find(a => a.ID_ART === item.ID_ART);
      const estAnt = art.ID_EST;
      art.ID_EST = ESTADOS_ARTICULO.PRESTADO;
      await art.save({ transaction: t });

      await Movimiento.create({
        TIP_MOV: 'PRESTAMO', DES_MOV: `Prestamo #${prestamo.ID_PRE}`,
        ID_EST_ANT: estAnt, ID_EST_NUE: ESTADOS_ARTICULO.PRESTADO,
        ID_ART: item.ID_ART, ID_USU: idUsu
      }, { transaction: t });
    }

    await Notificacion.create({
      ASU_NOT:     'Prestamo registrado',
      MEN_NOT:     `Prestamo #${prestamo.ID_PRE} creado con ${articulos.length} articulo(s).`,
      TIP_NOT:     TIPOS_NOTIFICACION.PRESTAMO_CREADO,
      EST_NOT:     'PENDIENTE',
      ID_PRE:      prestamo.ID_PRE,
      ID_USU_DEST: idUsu
    }, { transaction: t });

    return prestamo;
  });
}

async function registrarDevolucion(idPre, detallesDevolucion, idUsu) {
  return sequelize.transaction(async (t) => {
    const prestamo = await Prestamo.findByPk(idPre, {
      include: [{ model: DetallePrestamo, as: 'detalles' }],
      transaction: t
    });
    if (!prestamo) throw Object.assign(new Error('Prestamo no encontrado'), { statusCode: 404 });
    if (prestamo.EST_PRE !== ESTADOS_PRESTAMO.ACTIVO && prestamo.EST_PRE !== ESTADOS_PRESTAMO.VENCIDO) {
      throw Object.assign(new Error('El prestamo no esta activo'), { statusCode: 400 });
    }

    for (const detEnt of (detallesDevolucion || [])) {
      const detalle = prestamo.detalles.find(d => d.ID_DET_PRE === detEnt.ID_DET_PRE);
      if (!detalle) continue;
      detalle.EST_DEV = detEnt.EST_DEV || 'BUENO';
      if (detEnt.OBS_DET_PRE) detalle.OBS_DET_PRE = detEnt.OBS_DET_PRE;
      await detalle.save({ transaction: t });
    }

    for (const detalle of prestamo.detalles) {
      const articulo = await Articulo.findByPk(detalle.ID_ART, { transaction: t });
      if (!articulo) continue;
      const estAnt = articulo.ID_EST;
      const estadoFinal = (detalle.EST_DEV === 'DANADO')
        ? ESTADOS_ARTICULO.DANADO
        : ESTADOS_ARTICULO.DISPONIBLE;
      articulo.ID_EST = estadoFinal;
      await articulo.save({ transaction: t });

      await Movimiento.create({
        TIP_MOV: 'DEVOLUCION', DES_MOV: `Devolucion prestamo #${idPre}`,
        ID_EST_ANT: estAnt, ID_EST_NUE: estadoFinal,
        ID_ART: detalle.ID_ART, ID_USU: idUsu
      }, { transaction: t });
    }

    prestamo.EST_PRE = ESTADOS_PRESTAMO.DEVUELTO;
    prestamo.FEC_DEV_REAL = new Date();
    await prestamo.save({ transaction: t });

    return prestamo;
  });
}

async function cancelar(idPre, idUsu) {
  return sequelize.transaction(async (t) => {
    const prestamo = await Prestamo.findByPk(idPre, {
      include: [{ model: DetallePrestamo, as: 'detalles' }], transaction: t
    });
    if (!prestamo) throw Object.assign(new Error('Prestamo no encontrado'), { statusCode: 404 });
    if (prestamo.EST_PRE === ESTADOS_PRESTAMO.DEVUELTO) {
      throw Object.assign(new Error('No se puede cancelar un prestamo devuelto'), { statusCode: 400 });
    }

    for (const detalle of prestamo.detalles) {
      const articulo = await Articulo.findByPk(detalle.ID_ART, { transaction: t });
      if (articulo && articulo.ID_EST === ESTADOS_ARTICULO.PRESTADO) {
        articulo.ID_EST = ESTADOS_ARTICULO.DISPONIBLE;
        await articulo.save({ transaction: t });
      }
    }
    prestamo.EST_PRE = ESTADOS_PRESTAMO.CANCELADO;
    await prestamo.save({ transaction: t });
    return prestamo;
  });
}

async function vencidos() {
  return Prestamo.findAll({
    where: {
      EST_PRE: { [Op.in]: [ESTADOS_PRESTAMO.ACTIVO, ESTADOS_PRESTAMO.VENCIDO] },
      FEC_DEV_PRO: { [Op.lt]: new Date() }
    },
    include: includePrestamo,
    order: [['FEC_DEV_PRO', 'ASC']]
  });
}

module.exports = { listar, obtener, crearPrestamo, registrarDevolucion, cancelar, vencidos };
