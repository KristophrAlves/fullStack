import { Router } from 'express';
import { confirmRide, estimateRide, getRides } from '../controllers/ride.controller';

const router = Router();

router.post('/estimate', estimateRide);
router.patch('/confirm', confirmRide);
router.get("/:customer_id", getRides);

export default router;
