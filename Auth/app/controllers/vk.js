const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const axios = require('axios');

module.exports = (app) => {
  app.use('/auth/vk', router);
};

const client_id = '7907879';
const client_secret = 'QXBVBT9vcHFd2GSGNL3I';

// 1. 
router.get('/', async (req, res, next) => {
    //  1. Нужно отправить пользователя на авторизацию к VK
    let url = 'https://oauth.vk.com/authorize';
    url += `?client_id=${client_id}` + '&' +
    `redirect_uri=http://localhost:3000/auth/vk/code` + '&' +
    `display=page` + '&' + 
    `scope=${(1 << 22)}`;     //  права доступа на получение email          //  ДЛЯ TIKTOK использовать "user.info.basic"
    console.log(url);
    return res.status(303).redirect(url);
});

router.get('/code', async (req ,res) => {
    console.log(req.query.code);
    let tokens = await changeCodeToToken(req.query.code);
    console.log(tokens);
    let userData = await getUserData(tokens.access_token);
    console.log(userData);

    let exist = await checkUser({
        platform: 'vk',
        platformId: tokens.user_id
    });
    let user
    if (exist) {
        //  Такой пользователь есть в БД
        user = await UserModel.findOneAndUpdate({
            platform: 'vk',
            platformId: tokens.user_id
        }, {
            $set: {
                name: userData.response[0].first_name,
                lastName: userData.response[0].last_name
            }
        }, {
            new: true,
            runValidators: true
        });
    } else {
        //  Нет в бд
        user = new UserModel({
            platform: 'vk',
            platformId: tokens.user_id,
            name: userData.response[0].first_name,
            lastName: userData.response[0].last_name,
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
        client_id: client_id,
        client_secret: client_secret,
        redirect_uri: 'http://localhost:3000/auth/vk/code',
        code: code
    };

    const url = 'https://oauth.vk.com/access_token';

    //  Отправляем запрос к VK на обмен Code на токен
    let res = await axios.get(url, {
        params: params
    });

    //  Вовращаем тело ответа от VK
    return res.data;
}

async function getUserData(accessToken) {
    let params = {
        access_token: accessToken,

        v:5.131,
    };

    const url = 'https://api.vk.com/method/users.get';

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