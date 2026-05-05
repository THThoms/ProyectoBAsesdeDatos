require('dotenv').config();
const bcrypt = require('bcrypt');
const { connect, sequelize } = require('../config/database');
const {
  Rol, Usuario, EstadoArticulo, Categoria,
  Departamento, Ubicacion, Responsable
} = require('../models');
const logger = require('../utils/logger');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

async function ensure(Model, where, data) {
  const found = await Model.findOne({ where });
  if (found) return found;
  return Model.create({ ...where, ...data });
}

async function seed() {
  await connect();
  await sequelize.authenticate();

  logger.info('Seeding ROL...');
  await ensure(Rol, { NOM_ROL: 'ADMINISTRADOR' }, { DES_ROL: 'Acceso total al sistema' });
  await ensure(Rol, { NOM_ROL: 'DOCENTE' },       { DES_ROL: 'Gestion de prestamos e inventario' });
  await ensure(Rol, { NOM_ROL: 'ESTUDIANTE' },    { DES_ROL: 'Solo consulta' });

  logger.info('Seeding ESTADO_ARTICULO...');
  await ensure(EstadoArticulo, { NOM_EST: 'DISPONIBLE' },       { DES_EST: 'Articulo operativo y listo para prestamo' });
  await ensure(EstadoArticulo, { NOM_EST: 'PRESTADO' },         { DES_EST: 'Articulo actualmente en prestamo' });
  await ensure(EstadoArticulo, { NOM_EST: 'EN MANTENIMIENTO' }, { DES_EST: 'Articulo en proceso de mantenimiento' });
  await ensure(EstadoArticulo, { NOM_EST: 'DANADO' },           { DES_EST: 'Articulo con dano fisico o funcional' });
  await ensure(EstadoArticulo, { NOM_EST: 'DADO DE BAJA' },     { DES_EST: 'Articulo retirado del inventario' });

  logger.info('Seeding CATEGORIA...');
  for (const nom of ['Laptop','Proyector','Router','Tablet','Camara','Kit de Robotica','Otro']) {
    await ensure(Categoria, { NOM_CAT: nom }, { DES_CAT: `Categoria ${nom}` });
  }

  logger.info('Seeding DEPARTAMENTO...');
  const dep1 = await ensure(Departamento, { NOM_DEP: 'Carrera de Software' },  { DES_DEP: 'Carrera de Software FISEI' });
  const dep2 = await ensure(Departamento, { NOM_DEP: 'Carrera de Telecom' },   { DES_DEP: 'Carrera de Telecomunicaciones' });
  const dep3 = await ensure(Departamento, { NOM_DEP: 'Direccion FISEI' },      { DES_DEP: 'Direccion administrativa' });

  logger.info('Seeding UBICACION...');
  await ensure(Ubicacion, { NOM_UBI: 'Lab Software 1' }, { TIP_UBI: 'LABORATORIO', DES_UBI: 'Laboratorio de programacion', ID_DEP: dep1.ID_DEP });
  await ensure(Ubicacion, { NOM_UBI: 'Lab Software 2' }, { TIP_UBI: 'LABORATORIO', DES_UBI: 'Laboratorio de bases de datos', ID_DEP: dep1.ID_DEP });
  await ensure(Ubicacion, { NOM_UBI: 'Lab Redes' },      { TIP_UBI: 'LABORATORIO', DES_UBI: 'Laboratorio de redes',          ID_DEP: dep2.ID_DEP });
  await ensure(Ubicacion, { NOM_UBI: 'Aula 305' },       { TIP_UBI: 'AULA',        DES_UBI: 'Aula multimedia 305',           ID_DEP: dep1.ID_DEP });
  await ensure(Ubicacion, { NOM_UBI: 'Bodega Central' }, { TIP_UBI: 'ALMACEN',     DES_UBI: 'Almacen general',               ID_DEP: dep3.ID_DEP });

  logger.info('Seeding RESPONSABLE...');
  await ensure(Responsable, { COR_RESP: 'jose.caiza@uta.edu.ec' }, { NOM_RESP: 'Jose',  APE_RESP: 'Caiza',    TIP_RESP: 'DOCENTE',        TEL_RESP: '0998765432' });
  await ensure(Responsable, { COR_RESP: 'maria.lopez@uta.edu.ec' }, { NOM_RESP: 'Maria', APE_RESP: 'Lopez',    TIP_RESP: 'ADMINISTRATIVO', TEL_RESP: '0987654321' });
  await ensure(Responsable, { COR_RESP: 'carcos@uta.edu.ec' },     { NOM_RESP: 'Carlos',APE_RESP: 'Arcos',    TIP_RESP: 'ESTUDIANTE',     TEL_RESP: '0998111222' });

  logger.info('Seeding USUARIO admin...');
  const rolAdmin = await Rol.findOne({ where: { NOM_ROL: 'ADMINISTRADOR' } });
  const yaExiste = await Usuario.findOne({ where: { COR_USU: 'admin@fisei.uta.edu.ec' } });
  if (!yaExiste) {
    const hash = await bcrypt.hash('Admin2024!', ROUNDS);
    await Usuario.create({
      NOM_USU: 'Admin', APE_USU: 'GITT',
      COR_USU: 'admin@fisei.uta.edu.ec', CLA_USU: hash,
      EST_USU: 'ACTIVO', ID_ROL: rolAdmin.ID_ROL
    });
    logger.info('Admin creado: admin@fisei.uta.edu.ec / Admin2024!');
  } else {
    logger.info('Admin ya existia, no se modifica');
  }

  logger.info('Seed completado.');
  await sequelize.close();
  process.exit(0);
}

seed().catch(err => {
  logger.error('Seed fallo:', err);
  process.exit(1);
});
