import express from 'express';

import{
    createCategory,
    getCategoryById,
    getCategories,
    deleteCategory,
    updateCategory,
    deactivateCategory,
    activateCategory
} from "../../controllers/categories/index.js";

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/deactivate/:id', deactivateCategory);
router.patch('/activate/:id', activateCategory);

export default router;