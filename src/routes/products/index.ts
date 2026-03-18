import express from 'express';
import { protect, isAdmin } from '../../middlewares/authMiddleware.js';
import { storage } from '../../config/cloudinary.js';
import multer from 'multer';

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

const upload = multer ({ storage })

// Prueba de proteccion de rutas
router.post('/', upload.single('image'), protect, createProduct);
router.get('/', protect, getProducts);
router.get('/:id', protect, isAdmin, getProductById);
router.put('/:id', upload.single('image'), protect, isAdmin, updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);
router.patch('/deactivate/:id', protect, isAdmin, deactivateProduct);
router.patch('/activate/:id', protect, isAdmin, activateProduct);
router.patch('/update-stock/:id', protect, isAdmin, updateVariantStock);

export default router;