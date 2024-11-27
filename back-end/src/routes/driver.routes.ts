import { Router } from 'express';
import { getAllDrivers } from '../controllers/driver.controller';

const router = Router();

// Rota para buscar todos os motoristas
router.get('/drivers', getAllDrivers);

export default router;
