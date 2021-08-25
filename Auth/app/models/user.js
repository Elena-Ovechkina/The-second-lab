// Example model

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  password: String,         //  пароль - оно нужно только зарегистрированным через наш сервис пользователям
  login: String,            //  логин - оно нужно только зарегистрированным через наш сервис пользователям
  key: String,              //  ключ для шифрования - оно нужно только зарегистрированным через наш сервис пользователям
  //  platform - дает понять как авторизовался пользователь
  platform: {
    type: String,
    enum: ['vk', 'tiktok', 'local'],
    default: 'local'
  },
  //  platformId - идентификатор пользователя в той или иной системе (vk/tiktok) для понимания, что это за пользователь
  platformId: {
    type: String
  },
  token: String,
  typeOfPerson: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  name: String,
  lastName: String,
  score: Number
});

UserSchema.statics.setNewToken = async function (id) {
  let res = await this.findOneAndUpdate({
    _id: id
  }, {
    $set: {
      token: Math.random()
    }
  }, {
    new: true,
    runValidators: true
  });

  return res;
}

mongoose.model('User', UserSchema);

