import express from 'express';
import cors from 'cors';
import connectDB from './database.js';
import routes from './routes/index.js'
import "dotenv/config";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});