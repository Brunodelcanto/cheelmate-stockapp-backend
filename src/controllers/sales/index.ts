import type { Request, Response } from "express";
import Sale from "../../models/sale.js";
import Product from "../../models/product.js";

const createSale = async (req: Request, res: Response) => {
    try {
        const { items, customerName, comment } = req.body;

        // Validaciones iniciales
        if (!items || items.length === 0) {
            return res.status(400).json({
                message: 'No hay productos en la venta',
                error: true
            })
        }

        let totalAmount = 0;
        let totalProfit = 0;
        const saleItems = [];

        // Procesar cada item del carrito

        for (const item of items) {
            const product = await Product.findById(item.productId);

            // Validar existencia del producto y variante
            if (!product) {
                return res.status(404).json({
                    message: `Producto ${item.productId} no encontrado`,
                    error: true
                })   
            }
            const variant = product?.variants.find(v => v.color.toString() === item.variantId);

            // Validar stock
            if (!variant || variant.amount < item.quantity) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${product.name}`,
                    error: true
                })
            }

            // Calculamos totales con los precios del momento
            const itemPrice = variant.priceSell;
            const itemCost = variant.priceCost;

            totalAmount += itemPrice * item.quantity;
            totalProfit += (itemPrice - itemCost) * item.quantity;

            // Preparamos el item para el historico de la venta
            saleItems.push({
                productId: product._id,
                variantId: variant.color,
                name: product.name,
                quantity: item.quantity,
                priceAtSale: itemPrice,
                priceCostAtSale: itemCost
            });

            // Descontamos el stock
            variant.amount -= item.quantity;
            await product.save();
        }

        // Guardamos la venta definitiva

        const newSale = new Sale ({
            items: saleItems,
            totalAmount,
            totalProfit,
            customerName,
            comment
        })

        await newSale.save();

        return res.status(201).json({
            message: "Venta realizada con éxito",
            data: newSale,
            error: false,
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Error al procesar la venta",
            error: error.message
        });
    }
}

const getSales = async (req: Request, res: Response) => {
    try {
        // Permitir filtrar por rango de fechas usando query params
        const { startDate, endDate } = req.query;
        let query = {};

        // Si se proporcionan fechas, ajustamos el query para filtrar por createdAt
        if (startDate && endDate) {

            const start = new Date(startDate as string);
            start.setHours(0, 0, 0, 0); // Inicio del día

            const end = new Date(endDate as string);
            end.setHours(23, 59, 59, 999); // Fin del día

            query = {
                createdAt: {
                    $gte: start,
                    $lte: end
                }
            };
        }
        // Obtenemos las ventas con el filtro aplicado, populando los nombres de los productos y ordenando por fecha
        const sales = await Sale.find(query)
            .populate('items.productId', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Si no hay ventas, devolvemos un mensaje claro y evitamos errores al calcular totales
        if (!Array.isArray(sales) || sales.length === 0) {
            return res.status(200).json({
                message: "No sales found or the format is incorrect",
                totalRevenue: 0,
                totalProfit: 0,
                data: [],
                error: false
            });
        }

        // Calculamos el total de ingresos y ganancias sumando los campos totalAmount y totalProfit de cada venta
        const totals = sales.reduce((acc, sale) => {
            return {
                revenue: acc.revenue + (sale.totalAmount || 0),
                profit: acc.profit + (sale.totalProfit || 0) 
            };
        }, { revenue: 0, profit: 0 });

        // Devolvemos la respuesta con el conteo de ventas, ingresos totales, ganancias totales y los datos de las ventas
        return res.status(200).json({
            message: "Report generated successfully",
            count: sales.length,
            totalRevenue: totals.revenue,
            totalProfit: totals.profit,
            data: sales,
            error: false
        });

    } catch (error: any) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export { createSale, getSales };