import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Definimos una interfaz personalizada para que TS reconozca el userId en la request
export interface AuthenticatedRequest extends Request {
    userId?: string;
}

// Middleware de proteccion (verifica si esta logueado)
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Intentamos obtener el token de la cookie o del header Authorization
    let token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Acceso denegado, token no proporcionado',
            error: true
        });
    }

    try {
        // Verificamos el token con nuestra llave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as { id: string };

        // Inyectamos el ID del usuario en la request para que los controladores lo usen
        req.userId = decoded.id;

        next();

    } catch (error) {
        return res.status(401).json({
            message: 'Token inválido o expirado',
            error: true
        });
    }
};

// Middleware de Administrador (verifica permisos)
export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Buscamos al usuario usando el ID que nos dejó el middleware 'protect'
        const user = await User.findById(req.userId);

        if (user && (user.role === 'admin')) {
            next();
        } else {
            return res.status(403).json({
                message: 'Acceso denegado, permisos insuficientes',
                error: true
            });
        }

    } catch (error) {
        return res.status(500).json({
            message: 'Error al validar permisos de usuario',
            error: true
        });
    }
}
