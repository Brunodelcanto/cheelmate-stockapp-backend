import express from 'express';
import cors from 'cors';
import connectDB from './database.js';
import routes from './routes/index.js'
import "dotenv/config";
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const app = express();

const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

connectDB();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "res.cloudinary.com"], 
    },
  },
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", 
    credentials: true,               
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
}

app.use(express.json());
app.use(cookieParser());


app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});