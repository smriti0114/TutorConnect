import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
    index: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  classSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    required: true,
    unique: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending',
  },
  paymentDate: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  paymentReference: {
    type: String,
  },
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
