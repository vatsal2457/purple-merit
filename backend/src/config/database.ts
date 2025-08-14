import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Driver from '../models/Driver';
import Route from '../models/Route';
import Order from '../models/Order';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');

    // Check if data needs to be seeded
    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      await seedData();
      console.log('🌱 Database seeded with initial data');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async (): Promise<void> => {
  try {
    // Read seed data files
    const projectRoot = path.resolve(__dirname, '../../../');
    const driversData = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'data/drivers.json'), 'utf8')
    );
    const routesData = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'data/routes.json'), 'utf8')
    );
    const ordersData = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'data/orders.json'), 'utf8')
    );

    // Insert drivers
    await Driver.insertMany(driversData);
    console.log(`✅ Seeded ${driversData.length} drivers`);

    // Insert routes
    await Route.insertMany(routesData);
    console.log(`✅ Seeded ${routesData.length} routes`);

    // Insert orders
    await Order.insertMany(ordersData);
    console.log(`✅ Seeded ${ordersData.length} orders`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};
