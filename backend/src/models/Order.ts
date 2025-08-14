import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  value: number;
  assignedRoute: string;
  deliveryTimestamp: Date;
  assignedDriver?: string;
  actualDeliveryTime?: Date;
  isDelivered?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    required: [true, 'Order ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Order ID cannot exceed 10 characters']
  },
  value: {
    type: Number,
    required: [true, 'Order value is required'],
    min: [1, 'Order value must be at least ₹1'],
    max: [100000, 'Order value cannot exceed ₹100,000']
  },
  assignedRoute: {
    type: String,
    required: [true, 'Assigned route is required'],
    trim: true,
    uppercase: true
  },
  deliveryTimestamp: {
    type: Date,
    required: [true, 'Delivery timestamp is required']
  },
  assignedDriver: {
    type: String,
    trim: true
  },
  actualDeliveryTime: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for delivery status
orderSchema.virtual('deliveryStatus').get(function() {
  if (!this.isDelivered) return 'Pending';
  if (this.actualDeliveryTime && this.deliveryTimestamp) {
    return this.actualDeliveryTime <= this.deliveryTimestamp ? 'On Time' : 'Late';
  }
  return 'Unknown';
});

// Virtual for high value status
orderSchema.virtual('isHighValue').get(function() {
  return this.value > 1000;
});

// Indexes for efficient queries
orderSchema.index({ assignedRoute: 1 });
orderSchema.index({ assignedDriver: 1 });
orderSchema.index({ deliveryTimestamp: 1 });
orderSchema.index({ isDelivered: 1 });

export default mongoose.model<IOrder>('Order', orderSchema);
