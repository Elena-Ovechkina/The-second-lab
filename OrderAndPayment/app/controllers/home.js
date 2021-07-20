const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const OrderModel = mongoose.model('Order');

module.exports = (app) => {
    app.use('/order', router);
};

// Создание заказа
router.put('/', function (req, res, next) {
    let order = new OrderModel({
        idTable: req.body.idTable,
        idUser: req.body.idUser,
        idDishes: req.body.idDishes,
        totalPrice: req.body.totalPrice,
        code: req.body.code,
        payment: {},
        data: req.body.data
    })
    order.validate()                          //проверка соответсвия с типовым документом
        .then(function () {
            return order.save()
        })
        .then(function (one) {
            one = one.toJSON()
            return res.status(201).send(one)
        })
        .catch(function (error) {
            return res.status(500).send(error)
        })
})

// Получение списка заказов
router.get('/', function (req, res, next) {
    let actions = [
        OrderModel.find({}),
        OrderModel.count({})
    ]

    Promise.all(actions)
        .then(function (order) {
            let list = order[0];
            let count = order[1];
            list = list.map(function (item) {
                return item.toJSON();
            })
            return res.status(200).send({
                list: list,
                count: count
            })
        })
        .catch(function (error) {
            console.log(error)
            return res.status(500).send(error)
        });
});

// Получение заказа
router.get('/:id', function (req, res) {
    const orderId = req.params.id;

    OrderModel.findOne({ _id: orderId })
        .then(function (order) {
            if (!order) {
                return res.status(400).send({
                    message: 'Заказа с индентификатором' + orderId + 'в БД нет'
                });
            } else {
                order = order.toJSON()
                return res.status(200).send(order)
            }
        })
        .catch(function (err) {
            console.log(err);
            return res.status(500).send(err);
        });
});

// Изменение состояния заказа в зависимости от оплаты
router.patch('/address/:id', function (req, res) {
    let id = req.params.id;
    let body = req.body;
    OrderModel.findOneAndUpdate(
        { _id: id },
        {
            $set: {
                statusOfTheOrder: "complete",
                payment: {  //обновление полей
                    systemPayment: body.systemPayment,
                    nameOfTheCardInHash: body.nameOfTheCardInHash,
                    numberOfTheCardInHash: body.numberOfTheCardInHash,
                    data: body.data
                }
            }
        }, {
        new: true,
        runValidators: true
    })
        .then(function (document) {
            if (!document) {
                return res.status(404).send({ message: 'Заказ не найден' })
            }
            return res.status(200).send(document.toJSON())
        })
        .catch(function (error) {
            return res.status(500).send(error)
        })
});

// Изменение состояния заказа в зависимости от менеджера
router.patch('/:id', function (req, res) {
    const id = req.params.id;                        //id берется из маршрута, а не из тела запроса
    OrderModel.findOneAndUpdate(
        { _id: id },
        {
            $set: { statusOfTheOrder: 'decline' }
        },
        {
            runValidators: true,
            new: true
        })
        .then(function (document) {
            if (!document) {
                res.status(400).send({message: 'Такого документа' + document + 'в БД нет'})
            }
            else { 
                res.status(200).send(document) 
            }
        })
        .catch(function(err) {
            res.status(500).send(err)
        })
})

// Удаление заказа
router.delete('/:id', function (req, res) {
    const orderId = req.params.id;
    OrderModel.deleteOne({ _id: orderId })
        .then(function () {
            return res.status(202).send();
        })
        .catch(function (err) {
            console.log(err);
            return res.status(500).send(err);
        });
});