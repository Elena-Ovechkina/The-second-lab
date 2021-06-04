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

mongoose.model('Dishes', Dishes);