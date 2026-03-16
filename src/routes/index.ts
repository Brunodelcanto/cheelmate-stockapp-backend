import express from 'express';
import categorieRouter from './categories/index.js';
import colorRouter from './colors/index.js';

const router = express.Router();

router.use('/categories', categorieRouter);
router.use('/colors', colorRouter);

export default router;