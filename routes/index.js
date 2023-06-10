let express = require('express');
let router = express.Router();
let dbModule = require('../mssql/dbModule');

/* GET home page. */
router.get('/', function(req, res, next) {
    let successMsg = req.flash('success')[0];
    dbModule.getData().then(function (result) {//todo: осталось разобраться с внешкой и сделать single product page
        dbModule.getCategories().then(function (Categories) {
            dbModule.getBrands().then(function (Brands) {
                if(req.query.filter){//случай с фильтром
                    let filter = JSON.parse(req.query.filter),
                        productChunks = [],
                        chunkSize = 3,
                        products = [];
                    console.log(filter.brands.length);
                    console.log(filter.categories.length);
                    result.forEach(element => {
                        if(filter.brands.length > 0 && filter.categories.length > 0){
                            if(filter.brands.includes(element.Brand) && filter.categories.includes(element.Category)){
                                products.push(element);
                            }
                        } else if(filter.brands.length > 0 && filter.categories.length == 0) {
                            if(filter.brands.includes(element.Brand)){
                                products.push(element);
                            }
                        } else {
                            if(filter.categories.includes(element.Category)){
                                products.push(element);
                            }
                        }
                    });
                    for(let i=0; i<products.length; i+=chunkSize){
                        productChunks.push(products.slice(i,i+chunkSize));
                    }
                    res.render('Shop/index', { title: 'Shopping cart', products: productChunks, successMsg: successMsg,
                        noMessage: !successMsg, categories: Categories, noCategories: !Categories, brands: Brands, noBrands: !Brands,
                        filter:true});
                } else { // случай без фильтра
                    let productChunks = [],
                        chunkSize = 3;
                    for(let i=0; i<result.length; i+=chunkSize){
                        productChunks.push(result.slice(i,i+chunkSize));
                    }
                    res.render('Shop/index', { title: 'Shopping cart', products: productChunks, successMsg: successMsg,
                        noMessage: !successMsg, categories: Categories, noCategories: !Categories, brands: Brands, noBrands: !Brands});
                }
            });
        });
    })
});

router.post('/header/cart/amount', function(req, res, next) {
    let userId = req.body.userId;
    dbModule.getUserCartAmount(userId).then(function (result) {
        res.send([{totalQty: result[0].totalQty}]);
    });
});

router.post('/add-to-cart', function(req, res, next) {
    let userId = req.body.userId,
        prodId = req.body.prodId;//функция добавления в БД
    dbModule.getOrderId(userId).then(function (result) {
        if(result.length == 0){//создать новый заказ
            dbModule.createNewOrder(userId).then(function (resultCNO) {
                if(resultCNO == 'Новый заказ успешно создан!'){
                    dbModule.getOrderId(userId).then(function (resultGOI) {
                        let orderId = resultGOI[0].Id;
                        dbModule.addToCart(orderId,prodId).then(function (resultATC) {
                            if(resultATC == 'Успешно добавлено к заказу!'){
                                res.send({errorCode: 0});
                            } else {
                                res.send({errorCode: 1, errorMsg: 'Ошибка добавления'});
                            }
                        })
                    })
                } else {
                    res.send({errorCode: 1, errorMsg: 'Ошибка добавления'});
                }
            });
        } else {//дописать в существующий заказ
            let orderId = result[0].Id;
            dbModule.addToCart(orderId,prodId).then(function (resultATC) {
                if(resultATC == 'Успешно добавлено к заказу!'){
                    res.send({errorCode: 0});
                } else {
                    res.send({errorCode: 1, errorMsg: 'Ошибка добавления'});
                }
            })
        }
    });
});

router.get('/shopping-cart', function (req, res, next) {
    let userId = req.query.userId;
    if(userId){
        dbModule.getItems(userId).then(function (result) {
            if(result.length == 0){
                res.render('shop/shopping-cart', {products: null});
            } else {
                let totalPrice = +0;
                result.forEach(function (element) {
                    totalPrice += element.price*element.qty;
                });
                res.render('shop/shopping-cart', {products: result, totalPrice: totalPrice});
            }
        });
    } else {
        let data = JSON.parse(req.query.data);
        if(data == null){
            return res.render('shop/shopping-cart', {products: null});
        }
        res.render('Shop/shopping-cart', {products: data.items, totalPrice: data.totalPrice});
    }
});

router.delete('/shopping-cart', function (req, res, next) {
    let userId = req.body.userId,
        productId = req.body.productId,
        remove = req.body.remove;
    if(remove){
        dbModule.deleteProductFromOrderByUserId(userId,productId).then(function (result) {
            res.send({errorCode: 0});
        })
    } else {
        dbModule.updateProductAmountByUserId(userId,productId).then(function (result) {
            res.send({errorCode: 0});
        })
    }
});

router.get('/checkout', function (req, res, next) {
    let userId = req.query.userId;
    dbModule.getItems(userId).then(function (result) {
        if(result.length == 0){
            res.render('shop/shopping-cart', {products: null});
        } else {
            let totalPrice = +0;
            result.forEach(function (element) {
                totalPrice += element.price * element.qty;
            });
            let errMsg = req.flash('error')[0];
            res.render('Shop/checkout', {totalPrice: totalPrice, errMsg: errMsg, noError: !errMsg});
        }
    });
});

router.post('/checkout', function (req, res, next) {
    console.log(req.body);
    let userId = req.query.userId, name = req.body.name,
        totalPrice = +0, number = req.body.number,
        orderId, address = req.body.address;
    dbModule.getItems(userId).then(function (result) {
        if(result.length == 0){
            res.render('shop/shopping-cart', {products: null});
        } else {
            result.forEach(function (element) {
                totalPrice += element.price*element.qty;
            });
            dbModule.getOrderId(userId).then(function (result) {
                orderId = result[0].Id;
                let stripe = require('stripe')(
                    'sk_test_NLsZ268rT7qe29e0Na8c0IOc00akuYCqVB'
                );
                stripe.charges.create(
                    {
                        amount: totalPrice * 100,
                        currency: 'usd',
                        source: req.body.stripeToken,
                        description: 'Test Charge',
                    },
                    function(err, charge) {
                        if(err){
                            req.flash('error', err.message);
                            return res.redirect('/checkout');
                        }
                        dbModule.closeOrder(orderId).then(function (result) {
                            if(result == "Заказ успешно закрыт."){
                                dbModule.insertNewSale(orderId, totalPrice, number, address, name).then(function(resultNS){
                                    if(resultNS == "Оплата прошла успешно."){
                                        req.flash('success', 'Successfully bought product!');
                                        res.redirect('/');
                                    }
                                });
                            }
                        });
                    }
                );
            });
        }
    });
});

router.get('/single-product-page', function (req, res) {
    let prodId = req.query.prodId;
    dbModule.getDataById(prodId).then(function (result) {
        let re = /, /gi;
        result[0].Characteristics = result[0].Characteristics.replace(re, '\n');
        res.render('shop/single-product-page',{product: result[0]});
    });
});

router.get('/own-product', function (req, res, next) {
    res.render('user/ownProduct');
});

router.post('/own-product', function (req, res, next) {
    dbModule.insertOwnOrder(req.body.userId, req.body.name, req.body.number, req.body.brand,
        req.body.category, req.body.title, req.body.comments, req.body.amount).then(function (result) {
        if(result == "Личный заказ оформлен."){
            req.flash('success', 'Successfully ordered product!');
            res.send([{errorCode: 0}]);
        } else {
            res.send([{errorCode: 1}]);
        }
    });
});

module.exports = router;