const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    originalUrl: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    },
    renew: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;