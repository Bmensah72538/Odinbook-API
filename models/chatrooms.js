import mongoose from 'mongoose'

const chatroomsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    participants: [
        {
            user: { type: mongoose.Types.ObjectId, ref: 'Users', required: true },
            isAdmin: { type: Boolean, default: false },
        },
    ],
});

const Chatrooms = mongoose.model('Chatrooms', chatroomsSchema)

export default Chatrooms;