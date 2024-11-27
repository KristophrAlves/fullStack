import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import bodyParser from 'body-parser';

// Importar as rotas
import rideRoutes from './routes/ride.routes';
import driverRoutes from './routes/driver.routes';

const app = express();

// Habilita o CORS para todas as origens
app.use(cors());

// Carregar o arquivo swagger.yaml
const swaggerDocument = YAML.load('./src/swagger/swagger.yaml');

// Usar o Swagger UI na rota "/api-docs"
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para parsear o corpo das requisições
app.use(bodyParser.json());

// Usar as rotas
app.use('/ride', rideRoutes);
app.use('/driver', driverRoutes);

// Configuração do servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
