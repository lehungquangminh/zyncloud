import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { protect, admin } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/user', protect, userRoutes);
app.use('/api/admin', protect, admin, adminRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
