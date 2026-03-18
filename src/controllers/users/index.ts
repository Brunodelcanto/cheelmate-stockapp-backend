import type { Request, Response } from 'express';
import User from '../../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const createToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', {
        expiresIn: '2h'
    });
};

const sendTokenCookie = (res: Response, token: string) => {
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, 
        sameSite: 'none', 
        maxAge: 2 * 60 * 60 * 1000 
    });
};

const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Usuario ya existente' });

        const user = await User.create({
            name,
            email,
            password,
            role: 'vendedor'
        });

        const token = createToken(user._id.toString());

        sendTokenCookie(res, token);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role}
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = createToken(user._id.toString());
        sendTokenCookie(res, token);

        res.status(200).json({
            message: 'Login exitoso',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role}
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const logoutUser = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true, 
        sameSite: 'none'
    });
    res.status(200).json({ message: 'Sesión cerrada' });
};

export { registerUser, loginUser, logoutUser };