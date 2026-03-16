import type { Request, Response } from 'express';
import Category from '../../models/category.js';
import Product from '../../models/product.js';

const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;

        // Validacion de campos vacios
        if (!name) {
        return res.status(400).json({ 
            message: 'El nombre de la categoría es obligatorio',
            error: true,    
        });
        }

        // Verificamos si ya existe para evitar duplicados
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
        return res.status(400).json({ 
            message: 'Esta categoría ya existe',
            error: true
        });
        }

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ 
        message: 'Categoría creada exitosamente',
        data: category,
        error: false
        });

    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        })
    }
}

const getCategoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                message: 'Category not found',
                error: true,
            });
        }
        return res.status(200).json({
            message: 'Category fetched successfully',
            data: category,
            error: false,
        });
    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        });
    }
}

const getCategories = async (req: Request, res: Response) => {
    try {
        // Obtenemos todas las categorías 
        const categories = await Category.find().sort({ name: 1 }); // Ordenamos por nombre alfabéticamente
        return res.status(200).json({
            message: 'Categorías obtenidas exitosamente',
            data: categories,
            error: false,
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        })
    }
}

const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productsWithCategory = await Product.find({ category: id as string });

        if (productsWithCategory.length > 0) {
            return res.status(400).json({
                message: 'No se puede eliminar una categoría que tiene productos asociados',
                error: true,
            })
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            return res.status(404).json({
                message: "Categoria no encontrada",
                error: true,
            });
        }
        return res.status(200).json({
            message: 'Categoría eliminada exitosamente',
            error: false,
        });

    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        })
    }
}

const updateCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const  id  = req.params.id as string;
        
    const existingCategory = await Category.findOne ({
        name: { $regex: new RegExp(`^${name}$`, 'i')},
        _id: { $ne: id}
    });

    if (existingCategory) {
        return res.status(400).json({
            message: 'Esta categoría ya existe',
            error: true,
        })
    }

    const category = await Category.findByIdAndUpdate(
        id,
        {
            $set: req.body
        },
        { new: true }
    ); 
    if (!category) {
        return res.status(404).json({
            message: 'Categoría no encontrada',
            error: true,
        });
    }
     return res.status(200).json({
        message: 'Categoría actualizada exitosamente',
        data: category,
        error: false,
    });

    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        });
    }
}

const deactivateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const productsWithCategory = await Product.find({ category: id as string });

        if(productsWithCategory.length > 0) {
            return res.status(400).json({
                message: 'No se puede desactivar una categoría que tiene productos asociados',
                error: true,
            })
        }
        const category = await Category.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        )
        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada",
                error: true,
            });
        }
        return res.status(200).json({
            message: "Categoría desactivada exitosamente",
            data: category,
            error: false,
        })
    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        });
    }
}

const activateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const category = await Category.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        )
        if (!category) {
            return res.status(404).json({
                message: "Categoría no encontrada",
                error: true,
            });
        }
        return res.status(200).json({
            message: "Categoría activada exitosamente",
            data: category,
            error: false,
        });
    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        });
    }
}

export {
    createCategory,
    getCategoryById,
    getCategories,
    deleteCategory,
    updateCategory,
    deactivateCategory,
    activateCategory
}