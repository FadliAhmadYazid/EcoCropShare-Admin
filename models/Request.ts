import mongoose, { Schema, models } from 'mongoose';

const requestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plantName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'buah',
  },
  quantity: {
    type: String,
    default: '1',
  },
  status: {
    type: String,
    enum: ['open', 'fulfilled'],
    default: 'open',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

requestSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

requestSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Request = models.Request || mongoose.model('Request', requestSchema);
export default Request;