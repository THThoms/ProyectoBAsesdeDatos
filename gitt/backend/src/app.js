require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const logger = require('./utils/logger');
const { connect } = require('./config/database');
const swaggerSpec = require('./config/swagger');
const errorMiddleware = require('./middlewares/error.middleware');
const router = require('./routes');
const { iniciarJobs } = require('./jobs');

const app = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || './uploads')));

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(API_PREFIX, router);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});
app.use(errorMiddleware);

(async () => {
  try {
    await connect();
    require('./models');
    iniciarJobs();
    app.listen(PORT, () => {
      logger.info(`GITT API escuchando en http://localhost:${PORT}${API_PREFIX}`);
      logger.info(`Documentacion Swagger en http://localhost:${PORT}/api/docs`);
    });
  } catch (err) {
    logger.error('No se pudo iniciar el servidor:', err);
    process.exit(1);
  }
})();

module.exports = app;
