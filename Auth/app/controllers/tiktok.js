const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const axios = require('axios');

module.exports = (app) => {
  app.use('/auth/tiktok', router);
};

const client_id = '';
const client_secret = '';

router.get('/', async (req, res, next) => {
    //  1. Нужно отправить пользователя на авторизацию к VK
    let url = 'https://open-api.tiktok.com/platform/oauth/connect/';
    url += `?client_key=${client_id}` + '&' +
    `redirect_uri=http://localhost:3000/auth/tiktok/code` + '&' +
    `response_type=code` + '&' + 
    `scope=user.info.basic`;
    console.log(url);
    return res.status(303).redirect(url);
});

router.get('/code', async (req ,res) => {
    console.log(req.query.code);
    let tokens = await changeCodeToToken(req.query.code);
    console.log(tokens);
    let userData = await getUserData(tokens.open_id, tokens.access_token);
    console.log(userData);

    let exist = await checkUser({
        platform: 'tiktok',
        platformId: tokens.open_id
    });
    let user
    if (exist) {
        //  Такой пользователь есть в БД
        user = await UserModel.findOneAndUpdate({
            platform: 'tiktok', 
            platformId: tokens.open_id
        }, {
            $set: {
                name: userData.display_name,
            }
        }, {
            new: true,
            runValidators: true
        });
    } else {
        //  Нет в бд
        user = new UserModel({
            platform: 'tiktok',
            platformId: tokens.open_id,
            name: userData.display_name,
            score:0,
        });
        await user.validate();
        user = await user.save()
    }
    user = await UserModel.setNewToken(user._id.toString());
    return res.status(200).send(user.toJSON());
})


async function changeCodeToToken(code) {
    let params = {
        client_key: client_id,
        client_secret: client_secret,
        redirect_uri: 'http://localhost:3000/auth/tiktok/code',
        code: code,
        grant_type: 'authorization_code'
    };

    const url = 'https://open-api.tiktok.com/oauth/access_token/';

    //  Отправляем запрос к VK на обмен Code на токен
    let res = await axios.post(url, {
        params: params
    });

    //  Вовращаем тело ответа от VK
    return res.data;
}

async function getUserData(userId,accessToken) {
    let params = {
        open_id: userId,
        access_token: accessToken,
    };

    const url = 'https://open-api.tiktok.com/oauth/userinfo/';

    //  Запрашиваем у VK данные пользователя
    let res = await axios.get(url, {
        params: params
    });

    //  Возвращаем то, что прислал VK
    return res.data;
}

async function checkUser(filter) {
    let user = await UserModel.findOne(filter);
    if (user)
        return true;
    return false;
}