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

//  1. Экспортирование связки "типовой документ-коллекция" средствами mongoose и объедение с коллекцией
const model = mongoose.model('Dishes', Dishes);

//  2. Нативное для JS экспортирвоание (без объединия с коллекцией)
module.exports = model