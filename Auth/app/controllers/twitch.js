const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const axios = require('axios');

module.exports = (app) => {
  app.use('/auth/twitch', router);
};