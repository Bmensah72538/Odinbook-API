import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const friendshipSchema = new Schema({
  user1: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user2: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'], // Example statuses
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Friendship = mongoose.model('Friendship', friendshipSchema )

export default Friendship;