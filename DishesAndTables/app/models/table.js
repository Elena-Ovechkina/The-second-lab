//  Типовой документ, представляющий информацию о столиках и их
//  бронированнии

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Table = new Schema({
    name: {
        type: Number,
        required: true,
        unique: true
    },
    timeOfBooking: [Number],
    quantity: Number,
    availability: {
        type: Boolean,
        default: true
    },
    tags: [String],
    cost: {
        type: Number,
        min: 0
    }
});

const model = mongoose.model('Table', Table);