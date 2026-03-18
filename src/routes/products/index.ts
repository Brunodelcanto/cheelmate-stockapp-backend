import express from 'express';
import { protect, isAdmin } from '../../middlewares/authMiddleware.js';

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    deactivateProduct,
    activateProduct,
    updateVariantStock
} from '../../controllers/products/index.js';

const router = express.Router();

// Prueba de proteccion de rutas
router.post('/', protect, createProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, isAdmin, getProductById);
router.put('/:id', protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.patch('/deactivate/:id', protect, isAdmin, deactivateProduct);
router.patch('/activate/:id', protect, isAdmin, activateProduct);
router.patch('/update-stock/:id', protect, isAdmin, updateVariantStock);

export default router;