// Example model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Dishes = new Schema({
  listOfIngridients: [String],
  name: {
    type: String,
    required: true,
    unique: true
  },
  typeOfDishes: String,
  photo: String,
  description: String,
  availability: Boolean,
  tags: [String],
  cost: {
    type: Number,
    min: 0
  }
});

//  1. Экспортирование связки "типовой документ-коллекция" средствами mongoose
const model = mongoose.model('Dishes', Dishes);

//  2. Нативное для JS экспортирвоание
module.exports = model