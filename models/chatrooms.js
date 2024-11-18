import mongoose from 'mongoose'

const chatroomsSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Types.ObjectId, ref: 'Users' }],
    messages: [{type: mongoose.Types.ObjectId, ref: 'Messages'}]
})

const Chatrooms = mongoose.model('Chatrooms', chatroomsSchema)

export default Chatrooms;