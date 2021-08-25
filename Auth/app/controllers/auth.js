const crypto = require('crypto');   //  Библиотека для шифрования
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');

module.exports = (app) => {
  app.use('/auth', router);
};

router.put('/signup', async function (req, res) {
    try {
        //  1. Получаем данные из запроса
        let data = req.body;
        //  2. Проверяем данные из запроса
        //  Если нет хотя бы одного из параметров пользователя, мы его регистрировать не будем
        if (!data.login || !data.password || !data.name || !data.lastName) {
            return res.status(400).send({
                message: "Need more information"
            })
        }

        // 3. Проверка занятости логина
        let user = await UserModel.findOne({login: data.login}) 
        //  Если пользователь с данным логином уже есть, отказываем в регистрации
        if (user) {
            return res.status(400).send({
                message:"Current login is lock"
            });
        }

        // 4. Подготовка к записи в БД 
        //  4.1  Создание ключа для шифрования
        let key = crypto.randomBytes(32).toString('base64');       //  Нужно любое случайное значение
        //  4.2  Шифруем пароль
        console.log('До: ', data.password);
        data.password = crypto.createHmac("sha256", key)    //  Создали функцию для шифрования данных на основе key
            .update(data.password)                          //  Непосредственно шифруем данные
            .digest("hex");                                 //  Формат хранения (в 16ричной системе исчисления)

        console.log('После: ', data.password);

        //  5. Запись в БД
        user = new UserModel({
            login: data.login,
            password: data.password,
            key: key,
            name: data.name,
            lastName: data.lastName
        });
        await user.validate();
        user = await user.save();

        return res.status(201).send(user.toJSON());
    } catch (err) {
        return res.status(500).send(err);
    }
});

router.post('/signin', async function (req, res) {
    try {
        //  1. Получаем данные из тела запроса
        let data = req.body;
        //  2.  Проверяем данные на наличие
        if (!data.password || !data.login) {
            return res.status(400).send({
                message:"Login or password is undefined"
            });
        }

        //  3. Поиск пользователя по логину
        let user = await UserModel.findOne({login: data.login});

        if (!user) {
            //  Если пользователя с таким логином нет
            return res.status(400).send({
                message: 'Login or password is incorrect'
            });
        }

        //  4. Проверяем пароль
        //  4.1 Шифруем пароль который пароль
        let hashPassword = crypto.createHmac('sha256', user.key).update(data.password).digest('hex');

        //  4.2 Проверяем пароли
        if (hashPassword != user.password) {
            return res.status(400).send({
                message: 'Login or password is incorrect'
            });
        }

        user = await UserModel.setNewToken(user._id.toString());
        return res.status(200).send(user.toJSON())
    } catch (err) { 
        return res.status(500).send(err);
    }
});
