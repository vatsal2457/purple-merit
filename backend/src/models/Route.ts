import mongoose, { Document, Schema } from 'mongoose';

export interface IRoute extends Document {
  routeId: string;
  distance: number;
  trafficLevel: 'Low' | 'Medium' | 'High';
  baseTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const routeSchema = new Schema<IRoute>({
  routeId: {
    type: String,
    required: [true, 'Route ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Route ID cannot exceed 10 characters']
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0.1, 'Distance must be greater than 0'],
    max: [1000, 'Distance cannot exceed 1000 km']
  },
  trafficLevel: {
    type: String,
    required: [true, 'Traffic level is required'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: 'Traffic level must be Low, Medium, or High'
    }
  },
  baseTime: {
    type: Number,
    required: [true, 'Base time is required'],
    min: [1, 'Base time must be at least 1 minute'],
    max: [480, 'Base time cannot exceed 480 minutes (8 hours)']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for fuel cost calculation
routeSchema.virtual('fuelCost').get(function() {
  const baseCost = this.distance * 5; // ₹5/km base cost
  const surcharge = this.trafficLevel === 'High' ? this.distance * 2 : 0; // ₹2/km surcharge for high traffic
  return baseCost + surcharge;
});

// Virtual for adjusted time based on traffic
routeSchema.virtual('adjustedTime').get(function() {
  const trafficMultipliers = {
    'Low': 1.0,
    'Medium': 1.2,
    'High': 1.5
  };
  return Math.round(this.baseTime * trafficMultipliers[this.trafficLevel]);
});

// Indexes for efficient queries
routeSchema.index({ trafficLevel: 1 });
routeSchema.index({ distance: 1 });

export default mongoose.model<IRoute>('Route', routeSchema);
