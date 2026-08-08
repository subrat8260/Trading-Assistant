import { Router } from 'express';
import {
  getAllTrades,
  getTradeById,
  createTrade,
  updateTrade,
  deleteTrade,
} from '../controllers/trade.controller.js';

const router = Router();

router.route('/')
  .get(getAllTrades)
  .post(createTrade);

router.route('/:id')
  .get(getTradeById)
  .patch(updateTrade)
  .delete(deleteTrade);

export default router;
