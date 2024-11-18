import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const friendSchema = new Schema({
    requester: { type: mongoose.Types.ObjectId, ref: 'Users'},
    recipient: { type: mongoose.Types.ObjectId, ref: 'Users'},
    status: { 
        type: String, 
        enum: ['pending', 'friends']
    }
    
})

const Friends = mongoose.model('Friends', friendSchema )

export default Friends;