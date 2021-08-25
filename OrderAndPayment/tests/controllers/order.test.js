const chai = require ('chai');
const chaiHttp = require ('chai-http')
chai.use(chaiHttp);
const expect = chai.expect;
const server = require ('./../../app');

const mongoose = require('mongoose');
const OrderModel = mongoose.model('Order');
const lodash = require('lodash');

describe('Тесты обработчиков запроса', function() {
    describe('order', function() {

        //  Выполнить подготовку перед ВСЕМИ тестами внутри describe
        before(async function () {
            await DishesModel.deleteMany({})
        });

        //  Выполнить подготовку перед КАЖДЫМ тестом внутри describe
        beforeEach(async function () {
        });

        //  Выполнить подготовку после ВСЕХ тестов внутри describe
        after(async function () {
        });

        //  Выполнить подготовку после КАЖДОГО теста внутри describe
        afterEach(async function () {
        });

        it('PUT', async function() {
            let template = {
                idTable: '233',
                idUser: '123',
                idDishes: ['555', '099'],
                totalPrice: 199,
                code: 809,
                payment: {},
                data: 11.12
            };

            let order = await chai.request(server)
                .put('/order')                                                                 
                .send(template);

            expect(order).has.status(201);
            expect(order).to.be.json;
            expect(order.body._id).is.exist;

            for (let key in template) {
                if (key == 'payment') {
                    template.payment = {
                        _id: order.body[key]._id
                    };
                }
                expect(template[key]).to.be.eql(order.body[key])
            }
        })

        it('GET', async function() {
            let res = await chai.request(server)
                .get('/order')                                                
                .send();

            expect(res).has.status(200);
            expect(res).is.exist;

            expect(res.body.list).instanceOf(Array);
            expect(res.body.list).has.length(1);

            expect(res.body.count).to.be.a('number');
            expect(res.body.count).to.be.eql(1)                               
        })

        it('GET /:id', async function() {
            let order = await OrderModel.findOne({});
            order = order.toJSON();
            order._id = order._id.toString();
            order.payment._id = order.payment._id.toString();

            let res = await chai.request(server)
                .get('/order/' + order._id)
                .send();
            
            expect(res).has.status(200);
            expect(res).to.be.json;

            expect(res.body._id).to.be.eql(order._id);
            expect(lodash.isEqual(res.body, order)).is.true;
        })

        it('PATCH /address/:id', async function () {
            let order = await OrderModel.findOne();
            order = order.toJSON();
            order._id = order._id.toString();

            let template = {
                systemPayment: 'сбер',
                nameOfTheCardInHash: 'МИР',
                numberOfTheCardInHash: '3456 6543',
                data: 11.09
            };

            let res = await chai.request(server)
                .patch('/order/address/' + order._id)
                .send(template);
            
            expect(res).has.status(200);
            expect(res).to.be.json;

            expect(res.body._id).to.be.eql(order._id);
            expect(lodash.isEqual(res.body, order)).is.false;                   
        })

        it('PATCH /:id', async function () {
            let order = await OrderModel.findOne();
            order = order.toJSON();
            order._id = order._id.toString();

            let res = await chai.request(server)
                .patch('/order/' + order._id)
                .send()

            expect(res).has.status(200);
            expect(res).to.be.json;

            // 1. Проверка изменений документа без ответа от сервера
            // let orderId = await OrderModel.findOne({_id: order._id})
            // expect(orderId.statusOfTheOrder).to.be.eql('decline')

            // 2. Проверка изменений документа с ответом от сервера
            expect(res.body._id).to.be.eql(order._id);
            expect(lodash.isEqual(res.body.statusOfTheOrder, 'decline')).is.true;
        })

        it('DELETE /:id', async function () {
            let order = await OrderModel.findOne({});
            order = order.toJSON();

            let res = await chai.request(server)
                .delete('/order/' + order._id)
                .send();

            expect(res).has.status(202);

            let deletedOrder = await OrderModel.findOne({ _id: order._id });
            expect(deletedOrder).is.not.exist;
        });
    })
}) 