let express = require('express');
const { check, validationResult } = require('express-validator');
let router = express.Router();
let dbModule = require('../mssql/dbModule');
let dateFormat = require('dateformat');
//let csrf = require('csurf');

//let csrfProtection = csrf(); TODO: в отчёте оставить
//router.use(csrfProtection);
let messagesUp = [],
    messagesIn = [];

router.get('/signup', function (req, res, next) {
    res.render('user/signup', {csrfToken: req.csrfToken, messages: messagesUp, hasErrors: messagesUp.length>0});
});

router.post('/signup',[
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid password(min length is 5)').isLength({min:5})
], function (req,res, next) {
    dbModule.checkEmail(req.body.email).then(function (result) {
        messagesUp.length = 0;
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            errors.errors.forEach(function(error){
                messagesUp.push(error.msg);
            })
        }
        if(result[0].amount == 0 && messagesUp.length === 0){
            dbModule.insertNewUser(req.body.email, req.body.password).then(function(result){
                dbModule.checkUser(req.body.email, req.body.password).then(function (resultCU) {
                    res.send([{errorCode: 0, id:resultCU[0].id}]);
                })
            })
        } else {
            if(messagesUp.length == 0){
                messagesUp.push('E-mail is already in use.');
            }
            res.send([{errorCode: 1}]);
        }
    });
});

router.get('/signin', function (req, res, next) {
    res.render('user/signin', {csrfToken: req.csrfToken, messages: messagesIn, hasErrors: messagesIn.length>0});
});

router.post('/signin',[
    check('email', 'Invalid e-mail').isEmail(),
    check('password', 'Invalid password').notEmpty()
], function (req,res, next) {
    dbModule.checkUser(req.body.email, req.body.password).then(function (result) {
        messagesIn.length = 0;
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            errors.errors.forEach(function(error){
                messagesIn.push(error.msg);
            })
        }
        if(result[0].amount == 0){
            if(messagesIn.length == 0){
                messagesIn.push('Invalid e-mail or password.');
            }
            res.send([{errorCode: 1, id:result[0].id}]);
        } else{
            res.send([{errorCode: 0, id:result[0].id}]);
        }
    });
});

router.post('/cart-union', function (req,res, next) {
    let userId = req.body.userId,
        items = JSON.stringify(req.body.items);
    dbModule.getOrderId(userId).then(function (result) {
        let orderId = result[0].Id;
        dbModule.itemsUnion(items,orderId).then(function (result) {
            if(result='Успешно объединены.'){
                res.send([{errorCode: 0}]);
            } else {
                res.send([{errorCode: 1, msg:result}]);
            }
        });
    });
});

router.get('/profile', function (req, res, next) {
    let userId = req.query.userId, totalPrice = +0,
        Orders = [], counter = +0, orderId='', resultSizeCounter = +0,
        cart = {
            'items': [],
            'totalPrice': +0,
            'saleDate': ''
        }, a;
    dbModule.getAllSales(userId).then(function (result) {
        result.forEach(function (element) {
            resultSizeCounter++;
            if(counter == 0){
                counter++;
                cart.totalPrice = element.totalPrice;
                cart.saleDate = dateFormat(element.saleDate - 3 * 60 * 60 * 1000,'ddd mmm dd yyyy HH:MM');
                orderId = element.idOrder;
            }
            if(orderId != element.idOrder){
                Orders.push(cart);
                a = JSON.parse(JSON.stringify(Orders));
                Orders = a;
                counter = +0;
                orderId = element.idOrder;
                cart.items.splice(0,cart.items.length);
                cart.totalPrice = element.totalPrice;
                cart.saleDate = dateFormat(element.saleDate - 3 * 60 * 60 * 1000,'ddd mmm dd yyyy HH:MM');
                cart.items.push({'title': element.title, 'price': element.price, 'qty': element.qty});
            } else {
                cart.items.push({'title': element.title, 'price': element.price, 'qty': element.qty});
            }
            if(resultSizeCounter == (result.length)){
                Orders.push(cart);
                a = JSON.parse(JSON.stringify(Orders));
                Orders = a;
            }
        });
        dbModule.getAllFinishedOwnOrders(userId).then(function (resultFOO) {
            resultFOO.forEach(function (element) {
                cart.items.splice(0,cart.items.length);
                totalPrice = element.Amount * element.Price;
                cart.totalPrice = totalPrice;
                cart.saleDate = dateFormat(element.FinishDate - 3 * 60 * 60 * 1000,'ddd mmm dd yyyy HH:MM');
                cart.items.push({'title': element.Title, 'price': element.Price, 'qty': element.Amount});
                Orders.push(cart);
                a = JSON.parse(JSON.stringify(Orders));
                Orders = a;
            });
            Orders.sort(function( a, b ){
                return a.saleDate > b.saleDate ? 1 : ( a.saleDate < b.saleDate ? -1 : 0 );
            });
            Orders = Orders.reverse();
            res.render('user/profile', {orders: Orders, noOrders: !Orders});
        });
    });
});

module.exports = router;