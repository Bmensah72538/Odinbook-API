import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const msgSchema = new Schema({
    chatroomId: { type:  mongoose.Types.ObjectId, ref: 'Chatrooms'},
    messageText: { type: String, required: true},
    author: { type: mongoose.Types.ObjectId, ref:'Users'},
    seenBy: { type: mongoose.Types.ObjectId, ref:'Users'},
    date: {type: Date, default: Date.now}
})

const Messages = mongoose.model('Messages', msgSchema )

export default Messages;