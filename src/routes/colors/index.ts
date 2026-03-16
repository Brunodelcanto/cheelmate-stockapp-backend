import express from 'express';

import {
    createColor,
    getColors,
    getColorById,
    deleteColor,
    updateColor,
    deactivateColor,
    activateColor
} from '../../controllers/colors/index.js';

const router = express.Router();

router.post('/', createColor);
router.get('/', getColors);
router.get('/:id', getColorById);
router.put('/:id', updateColor);
router.delete('/:id', deleteColor);
router.patch('/deactivate/:id', deactivateColor);
router.patch('/activate/:id', activateColor);

export default router;