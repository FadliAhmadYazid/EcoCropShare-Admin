import mongoose, { Schema, models } from 'mongoose';

const historySchema = new Schema({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
  },
  requestId: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plantName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
  },
  type: {
    type: String,
    enum: ['post', 'request'],
    required: true,
  }
});

historySchema.virtual('id').get(function() {
  return this._id.toHexString();
});

historySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const History = models.History || mongoose.model('History', historySchema);
export default History;