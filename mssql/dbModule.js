const sql = require('mssql');

module.exports.getData = async function() {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select * from Product order by Brand, Title`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getCategories = async function() {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select Category from product group by category order by category`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getBrands = async function() {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select Brand from Product group by brand order by brand`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.checkEmail = async function(email) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select count(*) as amount from Users where email = '${email}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.insertNewUser = async function(email,password) {
    return new Promise(function(resolve, reject) {
        let usQuery = `insert into Users(email,password) values('${email}','${password}')`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Клиент успешно добавлен.");
        }).catch(function(err) {
            console.dir(err);
        });
    }).catch(function(err) {
        console.dir(err);
    });
};

module.exports.checkUser = async function(email, password) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select id,count(*) as amount from Users where email = '${email}' and password = '${password}' group by id`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            console.log(result);
            console.log(JSON.stringify(result.recordset));
            if(JSON.stringify(result.recordset).length == 2)
                resolve([{"id": "", "amount": 0}]);
            else
                resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getUserId = async function(email) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select id from Users where email = '${email}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getDataById = async function(id) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select * from Product where Id = '${id}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getUserCartAmount = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select sum(amount) as totalQty from OrdersDetails inner join Orders on Id=OrdersDetails.IdOrder 
            where Statement = 0 and Orders.IdUser = '${userId}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.getOrderId = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select Id from Orders where Statement = 0 and IdUser = '${userId}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            reject(err);
        });
    })
};

module.exports.createNewOrder = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `insert into Orders values (newId(),'${userId}',0)`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve('Новый заказ успешно создан!');
        }).catch(function(err) {
            reject(err);
        });
    })
};

module.exports.addToCart = async function(orderId,prodId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `insert into OrdersDetails values ('${orderId}','${prodId}',1)`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve('Успешно добавлено к заказу!');
        }).catch(function(err) {
            reject(err);
        });
    })
};

module.exports.getItems = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select OrdersDetails.IdProduct as prodId, Product.Title as title, Product.Price as price, 
        OrdersDetails.Amount qty from OrdersDetails inner join Product on OrdersDetails.IdProduct=Product.Id inner join
        Orders on OrdersDetails.IdOrder = Orders.Id where Orders.Statement = 0 and Orders.IdUser = '${userId}'`;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            reject(err);
        });
    })
};

module.exports.updateProductAmountByUserId = async function(userId,prodId) {
    return new Promise(function(resolve, reject) {
        let usQuery = `exec updateProductAmountByUserId '${userId}','${prodId}'`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Данные успешно обновлены.");
        }).catch(function(err) {
            console.dir(err);
            reject(err);
        });
    })
};

module.exports.deleteProductFromOrderByUserId = async function(userId,prodId) {
    return new Promise(function(resolve, reject) {
        let usQuery = `exec deleteProductFromOrderByUserId '${userId}','${prodId}'`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Данные успешно обновлены.");
        }).catch(function(err) {
            console.dir(err);
            reject(err);
        });
    })
};

module.exports.itemsUnion = function(items,orderId) {
    return new Promise(function(resolve, reject) {
        let usQuery = `exec cartUnion '${items}','${orderId}'`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Успешно объединены.");
        }).catch(function(err) {
            console.dir(err);
            reject(err);
        });
    })
};

module.exports.closeOrder = async function(orderId) {
    return new Promise(function(resolve, reject) {
        let usQuery = `update Orders set statement = 1 where Id = '${orderId}'`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Заказ успешно закрыт.");
        }).catch(function(err) {
            console.dir(err);
        });
    }).catch(function(err) {
        console.dir(err);
    });
};

module.exports.insertNewSale = async function(orderId, totalPrice, number, address, name) {
    return new Promise(function(resolve, reject) {
        let usQuery = `exec insertNewSaleProcedure '${orderId}',${totalPrice},'${number}','${address}','${name}'`;
        console.log(usQuery);
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Оплата прошла успешно.");
        }).catch(function(err) {
            console.dir(err);
        });
    }).catch(function(err) {
        console.dir(err);
    });
};

module.exports.getAllSales = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery;
        usQuery = `select * from getAllSales('${userId}') order by saleDate Desc, idOrder, title `;
        let obj = new sql.Request().query(usQuery).then(function (result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    })
};

module.exports.insertOwnOrder = async function(userId, name, number, brand, category, title, comments, amount) {
    return new Promise(function(resolve, reject) {
        let usQuery = `insert into UsersOrders values (neWId(),'${userId}','${name}','${number}','${brand}','${title}',
            '${category}','${comments}',${amount},null,0, null)`;
        let obj = new sql.Request().query(usQuery).then(function() {
            resolve("Личный заказ оформлен.");
        }).catch(function(err) {
            console.dir(err);
        });
    }).catch(function(err) {
        console.dir(err);
    });
};

module.exports.getAllFinishedOwnOrders = async function(userId) {
    return new Promise(function(resolve, reject) {
        let usQuery = `select * from UsersOrders where IdUser = '${userId}' and Statement = 2 order by FinishDate Desc`;
        let obj = new sql.Request().query(usQuery).then(function(result) {
            resolve(result.recordset);
        }).catch(function(err) {
            console.dir(err);
        });
    }).catch(function(err) {
        console.dir(err);
    });
};