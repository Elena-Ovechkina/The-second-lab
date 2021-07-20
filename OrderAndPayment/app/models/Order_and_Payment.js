// Example model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  systemPayment: String,
  nameOfTheCardInHash: String,
  numberOfTheCardInHash: String,
  data: Number
})

const OrderSchema = new Schema({
  idTable: {
    type: String,
    required: true
  },
  idUser: {
    type: String,
    required: true
  },
  idDishes: {
    type: [String],
    required: true
  },
  statusOfTheOrder: {
    type: String,
    enum: ['booking', 'complete', 'decline'],
    default: 'booking'
  },
  totalPrice: {
    type: Number,
    min: 0,
  },
  code: Number,
  payment: PaymentSchema,
  data: Number
});

mongoose.model('Order', OrderSchema);

//  Экспорт схемы для валидации или других операций над платежами
module.exports = {
  PaymentSchema
};