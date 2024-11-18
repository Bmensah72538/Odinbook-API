import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, index: true},
    password: { type: String, required: true},
    isMember: { type: Boolean, required: true},
    isAdmin: { type: Boolean, required: true },
    friends: { type: mongoose.Types.ObjectId, ref: 'Friends'}
})

const User = mongoose.model('users', userSchema )

export default User;