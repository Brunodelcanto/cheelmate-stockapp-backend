import express from 'express';

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

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.patch('/deactivate/:id', deactivateProduct);
router.patch('/activate/:id', activateProduct);
router.patch('/update-stock/:id', updateVariantStock);

export default router;