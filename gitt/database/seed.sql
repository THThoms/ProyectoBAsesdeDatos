-- =====================================================================
-- SEMILLA DE DATOS GITT
-- Ejecutar despues de schema.sql
-- Nota: el seeder de Node (npm run seed) tambien hace esto y ademas
-- crea el usuario admin con hash bcrypt. Este script SQL es un fallback.
-- =====================================================================

-- Roles
INSERT INTO ROL (NOM_ROL, DES_ROL) VALUES ('ADMINISTRADOR', 'Acceso total al sistema');
INSERT INTO ROL (NOM_ROL, DES_ROL) VALUES ('DOCENTE',       'Puede gestionar prestamos y consultar inventario');
INSERT INTO ROL (NOM_ROL, DES_ROL) VALUES ('ESTUDIANTE',    'Solo consulta de inventario y prestamos propios');

-- Estados de articulo
INSERT INTO ESTADO_ARTICULO (NOM_EST, DES_EST) VALUES ('DISPONIBLE',       'Articulo operativo y listo para prestamo');
INSERT INTO ESTADO_ARTICULO (NOM_EST, DES_EST) VALUES ('PRESTADO',         'Articulo actualmente en prestamo');
INSERT INTO ESTADO_ARTICULO (NOM_EST, DES_EST) VALUES ('EN MANTENIMIENTO', 'Articulo en proceso de mantenimiento');
INSERT INTO ESTADO_ARTICULO (NOM_EST, DES_EST) VALUES ('DANADO',           'Articulo con dano fisico o funcional');
INSERT INTO ESTADO_ARTICULO (NOM_EST, DES_EST) VALUES ('DADO DE BAJA',     'Articulo retirado del inventario');

-- Categorias
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Laptop',          'Computadores portatiles');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Proyector',       'Proyectores multimedia');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Router',          'Equipos de red');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Tablet',          'Tabletas digitales');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Camara',          'Camaras digitales');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Kit de Robotica', 'Kits educativos de robotica');
INSERT INTO CATEGORIA (NOM_CAT, DES_CAT) VALUES ('Otro',            'Equipos diversos');

-- Departamento y Ubicacion ejemplo
INSERT INTO DEPARTAMENTO (NOM_DEP, DES_DEP) VALUES ('Carrera de Software',  'Carrera de Software FISEI');
INSERT INTO DEPARTAMENTO (NOM_DEP, DES_DEP) VALUES ('Carrera de Telecom.',  'Carrera de Telecomunicaciones');
INSERT INTO DEPARTAMENTO (NOM_DEP, DES_DEP) VALUES ('Direccion FISEI',      'Direccion administrativa de la facultad');

INSERT INTO UBICACION (NOM_UBI, TIP_UBI, DES_UBI, ID_DEP) VALUES ('Lab Software 1', 'LABORATORIO', 'Laboratorio de programacion', 1);
INSERT INTO UBICACION (NOM_UBI, TIP_UBI, DES_UBI, ID_DEP) VALUES ('Lab Software 2', 'LABORATORIO', 'Laboratorio de bases de datos', 1);
INSERT INTO UBICACION (NOM_UBI, TIP_UBI, DES_UBI, ID_DEP) VALUES ('Lab Redes',      'LABORATORIO', 'Laboratorio de redes',          2);
INSERT INTO UBICACION (NOM_UBI, TIP_UBI, DES_UBI, ID_DEP) VALUES ('Aula 305',       'AULA',        'Aula multimedia 305',           1);
INSERT INTO UBICACION (NOM_UBI, TIP_UBI, DES_UBI, ID_DEP) VALUES ('Bodega Central', 'ALMACEN',     'Almacen general FISEI',         3);

-- Responsables ejemplo
INSERT INTO RESPONSABLE (NOM_RESP, APE_RESP, TIP_RESP, COR_RESP, TEL_RESP) VALUES ('Jose',   'Caiza',    'DOCENTE',        'jose.caiza@uta.edu.ec',    '0998765432');
INSERT INTO RESPONSABLE (NOM_RESP, APE_RESP, TIP_RESP, COR_RESP, TEL_RESP) VALUES ('Maria',  'Lopez',    'ADMINISTRATIVO', 'maria.lopez@uta.edu.ec',   '0987654321');
INSERT INTO RESPONSABLE (NOM_RESP, APE_RESP, TIP_RESP, COR_RESP, TEL_RESP) VALUES ('Carlos', 'Arcos',    'ESTUDIANTE',     'carcos@uta.edu.ec',        '0998111222');

-- Usuario administrador (la contrasena debe regenerarse desde el seeder de Node con bcrypt)
-- El siguiente hash corresponde a 'Admin2024!' generado con bcrypt rounds=12
INSERT INTO USUARIO (NOM_USU, APE_USU, COR_USU, CLA_USU, EST_USU, ID_ROL)
VALUES ('Admin', 'GITT', 'admin@fisei.uta.edu.ec',
        '$2a$12$LDx9ZVOZkYj5e7w6m5yOSe3M9oP1fX0KbUu4sR3uKx1mP9nVk2dXm',
        'ACTIVO', 1);

COMMIT;
