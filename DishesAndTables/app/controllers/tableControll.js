//  Написать группу обработчиков для ресурсов начинающихся на /table
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TablesModel = mongoose.model('Table');

module.exports = function (app) {
    app.use('/table', router)
}

// 1. Получение списка столиков GET и ресурс по имени /table
//async/await
router.get('/', async function (req, res, next) {
    try {
        let actions = [
            TablesModel.find({}),
            TablesModel.count({})
        ];
        actions = await Promise.all(actions);
        let table = actions[0];
        let count = actions[1];
        table = table.map(function (item) {
            return item.toJSON();
        })
        return res.status(200).send({
            list: table,
            count: count
        });
    } catch (error) {
        console.lpg(error);
        return res.status(500).send(error);
    }
});

//  Promise 
router.get('/experimental/promise/release', function (req, res, next) {
    let actions = [
        TablesModel.find({}),
        TablesModel.count({})
    ];
    Promise.all(actions)
        .then(function (actions) {
            let table = actions[0];
            let count = actions[1];
            table = table.map(function (item) {
                return item.toJSON();
            })
            return res.status(200).send({
                list: table,
                count: count
            })
        })
        .catch(function (error) {
            console.log(error)
            return res.status(500).send(error);
        });
});

// 2. Получение данных конкретного столика
//  Promise 
router.get('/:id', function (req, res, next) {
    //  основная логика обработки запроса
    //  Получаем идентификатор столика
    const tableID = req.params.id;

    //  Получаем столик из БД
    TablesModel.findOne({ _id: tableID })
        .then(function (table) {
            if (!table) {
                return res.status(404).send({
                    message: 'Столика с идентификатором ' + tableId + ' в БД нет'
                });
            }

            //  Отправляем созданный документ в формате JSON объекта
            return res.status(200).send(table.toJSON());
        })
        .catch(function (err) {
            //  если возникли ошибки, мы пытаемся об этом сообщить тут
            console.log(err);
            return res.status(500).send(err);
        });
});

//async/await
router.get('/experimental/promise/release/:id', async function (req, res, next) {
    try {
        const tableID = req.params.id;
        let table = await TablesModel.findOne({ _id: tableID })

        if (!table) {
            return res.status(404).send({
                message: 'Столика с идентификатором ' + tableId + ' в БД нет'
            });
        }

        return res.status(200).send(table.toJSON());
    } catch (error) {
        console.log(err);
        return res.status(500).send(err);
    }
});

// 3. Добавление нового столика (создание)
//  async/await
router.put('/', async function (req, res, next) {
    try {
        // 1. Вытаскиваем полезные данные из запроса
        let table = req.body;

        // 2. Создаём документ по образцу с данными из запроса
        let document = new TablesModel(table);

        //  3.  Проверяем корректность данных и записываем его в коллекцию
        document.validate();
        document = await document.save();

        //  4.  Отправляем созданный документ в формате JSON объекта
        return res.status(201).send(document.toJSON());

    } catch (error) {
        //  если возникли ошибки, мы пытаемся об этом сообщить тут
        console.log(error);
        return res.status(500).send(error);
    }
});

//  Promise
router.put('/experimental/promise/release', function (req, res, next) {
    let table = req.body;
    let document = new TablesModel(table);
    document.validate()                //в положительных случаях это имеет ответ undefined, в отриц. проброс ошибки
        .then(function () {
            //  undefined
            return document.save();
        })
        .then(function (document) {
            return res.status(201).send(document.toJSON());
        })
        .catch(function (error) {
            //  если возникли ошибки, мы пытаемся об этом сообщить тут
            console.log(error);
            return res.status(500).send(error);
        })
});

// 4. УДаление столика
//  callback
router.delete('/:id', function (req, res, next) {
    const tableId = req.params.id;

    //  Удаляем блюдо
    return TablesModel.deleteOne({ _id: tableId }, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        return res.status(202).send();
    })
});

//  Promise
router.delete('/experimental/promise/release/:id', function (req, res, next) {
    const tableId = req.params.id;
    TablesModel.deleteOne({ _id: tableId })
        .then(function () {
            return res.status(202).send();
        })
        .catch(function (err) {
            console.log(err);
            return res.status(500).send(err);
        });
});

//async/await
router.delete('experimental/promise/release/v2/:id', async function (req, res, next) {
    try {
        const tableId = req.params.id;
        await TablesModel.deleteOne({ _id: tableId })
        return res.status(202).send();
    } catch (error) {
        console.log(err);
        return res.status(500).send(err);
    };
});

// 5. Обновление данных столика
//  Promise 
router.patch('/:id', function (req, res, next) {
    const id = req.params.id;
    let tablesParts = req.body;

    //  3. Обновляем блюдо
    return TablesModel.findOneAndUpdate({
        _id: id
    }, {
        $set: tablesParts
    }, {
        new: true,
        runValidators: true
    })
        .then(function (tables) {
            //  4.  Если блюда нет, сообщаем об этом
            if (!tables) {
                return res.status(404).send({
                    message: 'Столика с идентификатором ' + id + ' в БД нет'
                });
            }
            //  5.  Если блюдо есть, то отправляем его новую версию
            return res.status(200).send(tables.toJSON());
        })
        .catch(function (err) {
            //  если возникли ошибки, мы пытаемся об этом сообщить тут
            console.log(err);
            return res.status(500).send(err);
        })
});

//async/await
router.patch('/experimental/promise/release/:id', async function (req, res, next) {
    try {
        const id = req.params.id;
        let tablesParts = req.body;
        let tables = await TablesModel.findOneAndUpdate({
            _id: id
        }, {
            $set: tablesParts
        }, {
            new: true,
            runValidators: true
        })
        //  4.  Если блюда нет, сообщаем об этом
        if (!tables) {
            return res.status(404).send({
                message: 'Столика с идентификатором ' + id + ' в БД нет'
            });
        }
        //  5.  Если блюдо есть, то отправляем его новую версию
        return res.status(200).send(tables.toJSON());

    } catch (err) {
        //  если возникли ошибки, мы пытаемся об этом сообщить тут
        console.log(err);
        return res.status(500).send(err);
    }
});

// 6. Изменение статуса столика по полю возможности к заказу 
// (В теле запроса в поле "available": Boolean - лежит решение о доступности данного (указанного в строке ресурса) столика)
/* /:id  - тут идентификатор  (req.params.id)
     req.body.available - решение о статусе столика
*/
router.patch('/:id/available', function (req, res, next) {
    let newState = req.body.available;
    const id = req.params.id;
    return TablesModel.findOneAndUpdate({
        _id: id
    }, {
        $set: { availability: newState }
    }, {
        new: true,
        runValidators: true
    })
        .then(function (table) {
            if (table) {
                res.status(200).send(table.toJSON())
            }
            if (!table) {
                res.status(404).send({ message: 'Данного столика нет в БД' })
            }
        }).catch(function (error) {
            //  new Error("Привет я ошибка и это мой текст")
            console.log(error)
            res.status(500).send(error)
        })
})