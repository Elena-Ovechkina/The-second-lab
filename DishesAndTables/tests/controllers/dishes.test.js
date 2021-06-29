//  Подключаем библиотку для тестирования
const chai = require('chai');
//  Подключаем плагин для библиотеки в файл
const chaiHttp = require('chai-http');

//  Подключаем плагин в библиотеку
chai.use(chaiHttp);

//  Помещаем инструменты в переменную
const expect = chai.expect;

//  Запускаем сервер
const server = require('./../../app');

//  Доп инструменты
const mongoose = require('mongoose');
const DishesModel = mongoose.model('Dishes');
const lodash = require('lodash')

//  Объявляем группу тестов "Тесты обработчиков запросов"
describe('Тесты обработчиков запросов', function () {

    //  Объявляем подгруппу тестов "/dishes"
    describe('/dishes', function () {

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

        //  Тест для обработчика запроса PUT /
        it('PUT /', async function () {
            // 1.  Описываем данные для создания блюда с корректными данными
            let template = {
                listOfIngridients: ['морковь','помидор','огурец'],
                name: 'зимний',
                typeOfDishes: 'салат',
                photo: '123.png',
                description: 'Вкусный летний салат',
                availability: true,
                tags: ['лето','салат дачный'],
                cost: 100
            };

            //  2.  Отправляем запрос на сервер
            let res = await chai.request(server)
                //  с методом PUT и ссылкой на ресурс /dishes
                .put('/dishes')
                //  в качестве данных для запроса выступает содержимое переменной
                //  template
                .send(template);        

            //  3.  Проверяем результат обработки запроса
            //  3.1 Ожидаем что результат имеет статус 201
            expect(res).has.status(201);
            //  3.2 Что результат в виде JSON
            expect(res).to.be.json;

            //  3.3 Что у документ есть уникальный идентификатор
            expect(res.body._id).is.exist;
            //  3.4 Проверяем, что все указанные в template свойства
            //  присвоились новосозданному документу
            for (let key in template) {
                expect(res.body[key]).to.be.eql(template[key]);
            }
        });

        it('GET /', async function () {
            let res = await chai.request(server)
                .get('/dishes')
                .send();

            expect(res).has.status(200);
            expect(res.body).is.exist;

            //  Проверка типа для сложных ТИПОВ (не примитивов)
            expect(res.body.list).instanceOf(Array);
            expect(res.body.list).has.length(1);
            
            //  Проверка типа для примитивов (Number, String, Boolean, Object, Function, Undefined, BigInt, Symbol)
            expect(res.body.count).to.be.a('number');
            expect(res.body.count).to.be.eql(1);
        });

        it('GET /:id', async function () {
            //  Похож на тест из GET /
            //  1.  Прежде чем что-то конкретное получить, надо это получить от БД
            let dishes = await DishesModel.findOne({});
            dishes = dishes.toJSON();
            dishes._id = dishes._id.toString();
            //  2.  Отправляем запрос на сервер чтобы "это" удалить
            let res = await chai.request(server)
                .get('/dishes/' + dishes._id)
                .send();

            //  3. Проверяем ответ от сервера
            expect(res).has.status(200);
            expect(res).to.be.json;

            //  4.  Проверяем то что мы запросили, то что просили
            //  другими словами что документ перед тестом
            //  равен документу от сервера
            expect(res.body._id).to.be.eql(dishes._id);
            expect(lodash.isEqual(res.body, dishes)).is.true;
        });

        it('PATCH /:id', async function () {
            //  Похож на тест PUT / и GET /:id
            let template = {
                listOfIngridients: ['морковь','огурец'],
                name: 'весенний',
                typeOfDishes: 'салат',
                photo: '125.png',
                description: 'Вкусный весенний салат',
                availability: true,
                tags: ['весна','салатик'],
                cost: 100
            };

            let dishes = await DishesModel.findOne({})
            dishes = dishes.toJSON();
            dishes._id = dishes._id.toString()
            
            let res = await chai.request(server)
                .patch('/dishes/' + dishes._id)
                .send(template);        

            expect(res).has.status(200);
            expect(res).to.be.json;
            expect(res.body._id).is.exist;
            
            expect(res.body._id).to.be.eql(dishes._id);
            expect(lodash.isEqual(res.body, dishes)).is.false;
        });

        it('DELETE /:id', async function () {
            //  Уникальный
            //  1.  Прежде чем что-то удалить, надо это получить
            let dishes = await DishesModel.findOne({});
            dishes = dishes.toJSON();
            //  2.  Отправляем запрос на сервер чтобы "это" удалить
            let res = await chai.request(server)
                .delete('/dishes/' + dishes._id)
                .send();

            //  3. Проверяем ответ от сервера
            expect(res).has.status(202);

            //  4.  Проверяем факт удаления
            let deletedDishes = await DishesModel.findOne({_id: dishes._id});
            expect(deletedDishes).is.not.exist;
        });
    });
});

/* 
before
beforeEach
      √ PUT /
afterEach
beforeEach
      √ 1
afterEach
beforeEach
      √ 2
afterEach
beforeEach
      √ 3
afterEach
after
*/