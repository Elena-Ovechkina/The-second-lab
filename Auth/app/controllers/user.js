const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const UserModel = mongoose.model('User');

module.exports = (app) => {
    app.use('/user', router);
};

// Выдача информации о пользователе
router.get('/:id', async function (req, res) {
    try {
        const id = req.params.id;
        const token = req.headers['authorization'];
        let initiator = await UserModel.findOne({ token: token });

        //  Если пользователя с таким токеном нет, то ему надо авторизоваться
        if (!initiator) {
            return res.status(401).send({message: 'Need authorize'});
        }

        //  Пользователь запрашивается собственные данные
        if (initiator.typeOfPerson == 'user' && initiator._id.toString() == id) {
            return res.status(200).send(initiator.toJSON());
        }

        if (initiator.typeOfPerson == 'admin' || initiator.typeOfPerson == 'manager') {
            let user = await UserModel.findOne({ _id: id });
            if (user)
                return res.status(200).send(user.toJSON());
            return res.status(404).send({ message: 'User not found' })
        }

        return res.status(403).send({ message: "Access denied" });
    } catch (err) {
        return res.status(500).send(err);
    }
});

// //  1 
// GET / wiki / страница HTTP / 1.1
// Host: ru.wikipedia.org
// //  2. headers
// User - Agent: Mozilla / 5.0(X11; U; Linux i686; ru; rv: 1.9b5) Gecko / 2008050509 Firefox / 3.0b5
// Accept: text / html
// Connection: close
// Authorization: % token %
//     //  3. body
//     -----