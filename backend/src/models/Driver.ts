import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  currentShiftHours: number;
  pastWeekHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const driverSchema = new Schema<IDriver>({
  name: {
    type: String,
    required: [true, 'Driver name is required'],
    trim: true,
    maxlength: [100, 'Driver name cannot exceed 100 characters']
  },
  currentShiftHours: {
    type: Number,
    required: [true, 'Current shift hours is required'],
    min: [0, 'Current shift hours cannot be negative'],
    max: [24, 'Current shift hours cannot exceed 24']
  },
  pastWeekHours: {
    type: Number,
    required: [true, 'Past week hours is required'],
    min: [0, 'Past week hours cannot be negative'],
    max: [168, 'Past week hours cannot exceed 168 (7 days × 24 hours)']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total hours this week
driverSchema.virtual('totalWeekHours').get(function() {
  return this.pastWeekHours + this.currentShiftHours;
});

// Virtual for fatigue status
driverSchema.virtual('isFatigued').get(function() {
  return this.currentShiftHours > 8;
});

// Index for efficient queries
driverSchema.index({ name: 1 });
driverSchema.index({ currentShiftHours: 1 });

export default mongoose.model<IDriver>('Driver', driverSchema);
