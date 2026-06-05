const cron = require('node-cron');
const { Op } = require('sequelize');
const { Prestamo, Notificacion } = require('../models');
const { ESTADOS_PRESTAMO, TIPOS_NOTIFICACION } = require('../utils/constants');
const logger = require('../utils/logger');

async function detectarPrestamosVencidos() {
  try {
    const ahora = new Date();
    const vencidos = await Prestamo.findAll({
      where: {
        EST_PRE: ESTADOS_PRESTAMO.ACTIVO,
        FEC_DEV_PRO: { [Op.lt]: ahora }
      }
    });

    for (const p of vencidos) {
      p.EST_PRE = ESTADOS_PRESTAMO.VENCIDO;
      await p.save();

      await Notificacion.create({
        ASU_NOT:     'Prestamo vencido',
        MEN_NOT:     `El prestamo #${p.ID_PRE} esta vencido. Fecha esperada: ${p.FEC_DEV_PRO.toISOString().split('T')[0]}`,
        TIP_NOT:     TIPOS_NOTIFICACION.PRESTAMO_VENCIDO,
        EST_NOT:     'PENDIENTE',
        ID_PRE:      p.ID_PRE,
        ID_USU_DEST: p.ID_USU
      });
    }
    logger.info(`Job prestamos vencidos: ${vencidos.length} marcados`);
  } catch (err) {
    logger.error('Error en job prestamos vencidos:', err.message);
  }
}

function iniciarJobs() {
  const cronExpr = process.env.CRON_PRESTAMOS_VENCIDOS || '0 8 * * *';
  cron.schedule(cronExpr, detectarPrestamosVencidos);
  logger.info(`Cron prestamos vencidos programado (${cronExpr})`);
}

module.exports = { iniciarJobs, detectarPrestamosVencidos };
