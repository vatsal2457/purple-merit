import mongoose from 'mongoose'
import User from '../models/User'
import dotenv from 'dotenv'

dotenv.config()

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@purplemerit.com' })
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists')
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@purplemerit.com',
      password: 'admin123',
      role: 'admin'
    })

    await adminUser.save()
    console.log('✅ Admin user created successfully')
    console.log('📧 Email: admin@purplemerit.com')
    console.log('🔑 Password: admin123')

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error)
    process.exit(1)
  }
}

seedAdmin()
