import dotenv from 'dotenv';
import app from './src/app.js';
import userRoutes from './src/routes/user.routes.js';
import connectDB from './src/config/db.js';
import sosRoutes from './src/routes/sos.routes.js';

dotenv.config();

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 8000;
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/sos', sosRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer(); 