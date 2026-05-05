const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GITT API',
      version: '1.0.0',
      description: 'API REST del sistema de Gestion de Inventario Tecnologico de la FISEI - UTA'
    },
    servers: [
      { url: 'http://localhost:3001/api/v1', description: 'Desarrollo' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js']
};

module.exports = swaggerJSDoc(options);
