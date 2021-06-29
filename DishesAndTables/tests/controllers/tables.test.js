const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const server = require('./../../app');

const mongoose = require('mongoose')
const TableModel = mongoose.model('Table')
const lodash = require('lodash');
const { toPairs } = require('lodash');

describe('Тесты обработчков запросов', function () {
    describe('/tables', function () {
        before(async function () {
            await TableModel.deleteMany({})
        });

        beforeEach(async function () {
        });

        after(async function () {
        });

        afterEach(async function () {
        });

        //  Тест для обработчика запроса PUT /
        it('PUT /', async function () {
            let template = {
                name: 1,
                timeOfBooking: [13, 15],
                quantity: 4,
                availability: true,
                tags: ['столик1'],
                cost: 120
            };

            let res = await chai.request(server)
                .put('/table')
                .send(template);

            expect(res).has.status(201);
            expect(res).to.be.json;
            expect(res.body._id).is.exist;

            for (let key in template) {
                expect(res.body[key]).to.be.eql(template[key]);
            }
        });

        it('GET /', async function () {
            let res = await chai.request(server)
                .get('/table')
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
            let table = await TableModel.findOne({});
            table = table.toJSON();
            table._id = table._id.toString();

            let res = await chai.request(server)
                .get('/table/' + table._id)
                .send();

            expect(res).has.status(200);
            expect(res).to.be.json;

            expect(res.body._id).to.be.eql(table._id);
            expect(lodash.isEqual(res.body, table)).is.true;
        });

        it('PATCH /:id', async function () {
            let table = await TableModel.findOne();
            table = table.toJSON();
            table._id = table._id.toString();

            let template = {
                name: 5,
                timeOfBooking: [14],
                quantity: 7,
                availability: true,
                tags: ['столик5'],
                cost: 99
            }

            let res = await chai.request(server)
                .patch('/table/' + table._id)
                .send(template);

            expect(res).has.status(200);
            expect(res).to.be.json;

            expect(res.body._id).to.be.eql(table._id);
            expect(lodash.isEqual(res.body, table)).is.false;
        });

        it('DELETE /:id', async function () {
            let table = await TableModel.findOne({});
            table = table.toJSON();

            let res = await chai.request(server)
                .delete('/table/' + table._id)
                .send();

            expect(res).has.status(202);

            let deletedTable = await TableModel.findOne({ _id: table._id });
            expect(deletedTable).is.not.exist;
        });
    })
})