import mongoose from 'mongoose'
import User from '../models/User'
import dotenv from 'dotenv'

dotenv.config()

const seedManager = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(mongoURI)
    console.log('✅ Connected to MongoDB')

    // Check if manager already exists
    const existingManager = await User.findOne({ email: 'manager@purplemerit.com' })
    
    if (existingManager) {
      console.log('⚠️  Manager user already exists')
      process.exit(0)
    }

    // Create manager user
    const managerUser = new User({
      name: 'Logistics Manager',
      email: 'manager@purplemerit.com',
      password: 'password123',
      role: 'manager'
    })

    await managerUser.save()
    console.log('✅ Manager user created successfully')
    console.log('📧 Email: manager@purplemerit.com')
    console.log('🔑 Password: password123')

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Error seeding manager:', error)
    process.exit(1)
  }
}

seedManager()
