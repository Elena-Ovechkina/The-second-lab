const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// 1.  Импорт через mongoose
// const DishesModel = mongoose.model('Dishes');
// 2.  Импорт через module.exports
const DishesModel = require('../models/dishes');

module.exports = function (app) {
    app.use('/dishes', router);
};

//  get /dishes
//  1.  Получение блюд списком   GET и ресурс по имени /dishes
//  async/await
router.get('/', async function (req, res, next) {
    try {

        let actions = [
            DishesModel.find({}),           //  Получение документов из коллекции
            DishesModel.count({})  //  Получение количества документов в коллекции
        ];
        //  Ждем результата из БД для двух обращений к БД
        actions = await Promise.all(actions);
        //  Помещаем блюда в переменную dishes
        let dishes = actions[0];
        //  Помещаем количество блюд в БД в переменную count
        let count = actions[1];

        //  преобразование документов в удобный формат
        dishes = dishes.map(function (item) {
            return item.toJSON();
        });

        //  ответ пользователю/агрегатору со списком блюд
        return res.status(200).send({
            list: dishes,
            count: count
        });
    } catch (error) {
        //  если возникли ошибки, мы пытаемся об этом сообщить тут
        console.log(error);
        return res.status(500).send(error);
    }
});

//  2.  Получение конкретного блюда   (GET и помимо имени сущности указывается ее уникальный идентификатор)
//  Promise 
router.get('/:id', function (req, res, next) {
    //  основная логика обработки запроса
    //  Получаем идентификатор блюда
    const dishesId = req.params.id;

    //  Получаем блюдо из БД
    DishesModel.findOne({ _id: dishesId })
        .then(function (dishes) {
            //  Если блюда нет в БД
            if (!dishes) {
                return res.status(404).send({
                    message: 'Блюда с идентификатором ' + dishesId + ' в БД нет'
                });
            }

            //  Отправляем созданный документ в формате JSON объекта
            return res.status(200).send(dishes.toJSON());
        })
        .catch(function (err) {
            //  если возникли ошибки, мы пытаемся об этом сообщить тут
            console.log(err);
            return res.status(500).send(err);
        });
});

//  3.  Удаление блюда  
//  callback
router.delete('/:id', function (req, res, next) {
    const dishesId = req.params.id;

    //  Удаляем блюдо
    return DishesModel.deleteOne({ _id: dishesId }, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(202).send();
    })
});

//  4.  Создание блюда
//  async/await
router.put('/', async function (req, res, next) {
    try {
        //  основная логика обработки запроса
        //  1. запись данных о блюде (полезных данных) в переменную из запроса
        let dishes = req.body;

        //  2. Создаем документ по типовому образцу
        let document = new DishesModel(dishes);

        //  3.  Проверяем корректность данных, до того как запишем его в коллекцию
        document.validate();

        //  4.  Записываем его в коллекцию
        document = await document.save();

        //  5.  Отправляем созданный документ в формате JSON объекта
        return res.status(201).send(document.toJSON());

    } catch (error) {
        //  если возникли ошибки, мы пытаемся об этом сообщить тут
        console.log(error);
        return res.status(500).send(error);
    }
});

//  5.  Изменение блюда
//  Promise 
router.patch('/:id', function (req, res, next) {
    //  основная логика обработки запроса
    //  1.  Запись идентификатора в переменную
    const id = req.params.id;

    //  2. запись данных о блюде (полезных данных) в переменную из запроса
    let dishesParts = req.body;

    //  3. Обновляем блюдо
    return DishesModel.findOneAndUpdate({
        _id: id
    }, {
        $set: dishesParts           //  Мы ожидаем, что dishesParts представляет собой часть типового документ в
        //  Формате объекта  
        /**
         * {
         *      name: 'Оливье'
         * }
         */
    }, {
        new: true,
        runValidators: true
    })
        .then(function (dishes) {
            //  4.  Если блюда, сообщаем об этом
            if (!dishes) {                                     //в dishes попадёт в документ с обнолёнными полями
                return res.status(404).send({
                    message: 'Блюда с идентификатором ' + id + ' в БД нет'
                });
            }

            //  5.  Если блюдо есть, то отправляем его новую версию
            return res.status(200).send(dishes.toJSON());
        })
        .catch(function (err) {
            //  если возникли ошибки, мы пытаемся об этом сообщить тут
            console.log(err);
            return res.status(500).send(err);
        })
});