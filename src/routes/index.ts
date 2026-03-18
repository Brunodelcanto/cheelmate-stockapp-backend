import express from 'express';
import categorieRouter from './categories/index.js';
import colorRouter from './colors/index.js';
import productRouter from './products/index.js';
import saleRouter from './sales/index.js';
import userRouter from './users/index.js';

const router = express.Router();

router.use('/categories', categorieRouter);
router.use('/colors', colorRouter);
router.use('/products', productRouter);
router.use('/sales', saleRouter);
router.use('/users', userRouter);

export default router;