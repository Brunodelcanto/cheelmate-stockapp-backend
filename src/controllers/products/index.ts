import type { Request, Response } from 'express';
import Product from '../../models/product.js';
import {cloudinary} from '../../config/cloudinary.js';

const createProduct = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        // Validamos si ya existe un producto con el mismo nombre (ignorando mayúsculas)
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') } // Búsqueda insensible a mayúsculas  
        })

        if (existingProduct) {
            return res.status(400).json({
                message: "Este producto ya existe",
                error: true,
            }) 
        }

        if (!req.file) {
            return res.status(400).json({
                message: "La imagen del producto es obligatoria",
                error: true,
            })
        }

        let variantsData;
        try {
        variantsData = typeof req.body.variants === 'string' 
        ? JSON.parse(req.body.variants) 
        : req.body.variants;
        } catch (e) {
        return res.status(400).json({ message: "El formato de las variantes es inválido" });
        }

        const productData = {
            ...req.body,
            variants: variantsData, 
            image: {
            url: req.file.path,
             public_id: req.file.filename
            }   
        };

        // Si no existe, creamos el nuevo producto
        const product = new Product(productData);
        // Guardamos el producto en la base de datos
        await product.save();

        return res.status(201).json({
            message: "Producto creado exitosamente",
            data: product,
            error: false,  
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Error al crear el producto",
            error: error.message,
        })
    }
}

const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find()
        .populate('category', 'name') // Popula solo el campo 'name' de la categoría
        .populate('variants.color', 'name hex') // Popula solo los campos 'name' y 'hex' del color en las variantes
        .sort({ createdAt: -1}); // Ordena por fecha de creación (más reciente primero)

        return res.status(200).json({
            message: 'Productos obtenidos exitosamente',
            data: products,
            error: false,
        })
    } catch (error: any) {
        return res.status(500).json({
            message: 'Error al obtener los productos',
            error: error.message,
        })
    }
}

const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const products = await Product.findById(id)
        .populate('category', 'name') // Popula solo el campo 'name' de la categoría
        .populate('variants.color', 'name hex'); // Popula solo los campos 'name' y 'hex' del color en las variantes

        if (!products) {
            return res.status(404).json({
                message: "Producto no encontrado",
                error: true,
            })
        }

        return res.status(200).json({
            message: "Producto obtenido exitosamente",
            data: products,
            error: false,
        })

    } catch (error: any) {
        return res.status(500).json({
            message: "Error al obtener el producto",
            error: error.message,
        })
    }
}

const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Producto no encontrado",
                error: true,
            })
        }

        if (product.image?.public_id) {
            await cloudinary.uploader.destroy(product.image.public_id); // Elimina la imagen de Cloudinary
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Producto eliminado exitosamente",
            data: product,
            error: false,
        })

    } catch (error: any) {
        return res.status(500).json({
            message: "Error al eliminar el producto",
            error: error.message,
        })
    }
}

const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { name, category, minStockAlert, variants } = req.body;

        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({
                message: "Producto no encontrado",
                error: true,
            })
        }
        const existingProduct = await Product.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }, // Búsqueda insensible a mayúsculas
            _id: { $ne: id } // Excluye el producto actual de la búsqueda
        });

        if (existingProduct) {
            return res.status(400).json({
                message: "Este producto ya existe",
                error: true,
            });
        }
        // Construimos el objeto de actualización con los campos permitidos
        const updateData: any = {
            name,
            category,
            minStockAlert,
        }

        // Si se proporcionan variantes, las parseamos y las agregamos al objeto de actualización
         if (variants) {
            updateData.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        }

        // if (req.file) {

        //     // Si el producto ya tiene una imagen, eliminamos la imagen anterior de Cloudinary
        //     if (productToUpdate.image?.public_id) {
        //         await cloudinary.uploader.destroy(productToUpdate.image.public_id);
        //     }

        //     // Agregamos la nueva imagen al objeto de actualización
        //     updateData.image = {
        //         url: (req.file as any).path || (req.file as any).secure_url,
        //         public_id: (req.file as any).filename || (req.file as any).public_id,
        //     }
        // }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category', 'name').populate('variants.color');

        return res.status(200).json({
            message: "Producto actualizado exitosamente",
            data: updatedProduct,
            error: false,
        })

    } catch (error: any) {
        return res.status(500).json({
            message: "Error al actualizar el producto",
            error: error.message,
        })
    }
}

const deactivateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {new: true}
        )
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
            })
        }
        return res.status(200).json({
            message: 'Product deactivated successfully',
            error: false
        })
    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        })
    }
}

const activateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(
            id,
            {
                isActive: true
            },
            {new: true}
        )
        if (!product) {
            return res.status(404).json({
                message: 'Product not found',
                error: true,
            })
        }
        return res.status(200).json({
            message: 'Product activated successfully',
            error: false
        })
    } catch (error: any) {
        return res.status(400).json({
            error: error.message
        })
    }
}

const updateVariantStock = async (req: Request, res: Response) => {
    try {
        const id =  req.params.id as string;
        const { color, quantity } = req.body;

        const updateProduct = await Product.findOneAndUpdate(
            { _id: id, 'variants.color': color },
            { $inc: { 'variants.$.amount': quantity } },
            { new: true }
        ).populate('category', 'name')
        .populate('variants.color');

        if (!updateProduct) {
            return res.status(404).json({
                message: 'Producto o variante no encontrado',
            })
        }

        return res.status(200).json({
            message: 'Stock actualizado exitosamente',
            data: updateProduct,
            error: false,
        });
    } catch (error: any) {
        return res.status(500).json({
            message: 'Error al actualizar el stock',
            error: true,
        });
    }
}

export {
    createProduct,
    getProducts,
    getProductById,
    deleteProduct,
    updateProduct,
    deactivateProduct,
    activateProduct,
    updateVariantStock,
}