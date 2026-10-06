import express, { Application } from 'express';
import apiRoutes from './routes/api.routes';

const app: Application = express();

// Middlewares
app.use(express.json());

// Rotas da API
app.use('/', apiRoutes);

export default app;