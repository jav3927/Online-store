let Product = require('../models/product');

let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping', {
    useNewUrlParser: true
});

let products = [
    new Product({
        imagePath:  'https://content2.onliner.by/catalog/device/large/7cd37e4850f8812fc737d4d811eddca2.jpeg',
        title:'ASUS TUF Gaming',
        description: 'This is description of ASUS TUF gaming laptop',
        price: 900
    }),
    new Product({
        imagePath:  'https://mobile-review.com/news/wp-content/uploads/Apple_iPhone-11-Pro_Colors_091019_big.jpg',
        title:'Iphone 11 Pro Max',
        description: 'This is description of Iphone 11 Pro Max',
        price: 1100
    }),
    new Product({
        imagePath:  'https://images-na.ssl-images-amazon.com/images/I/71IUWVlNaeL._AC_SX466_.jpg',
        title:'ASUS ROG Phone 2',
        description: 'This is description of ASUS ROG Phone 2',
        price: 550
    }),
    new Product({
        imagePath:  'https://lh3.googleusercontent.com/proxy/RjWl9rQMi9uQMnFKxhMybgRZv32Tyz9U1zMnKlgHK-JeuP_dRlyMppXIGPbgDqVTRy_7DOrLGEhaN7lf-tkhO55baQD4BZEFaNd-lciVdEIbyQ',
        title:'Samsung Smart TV 4',
        description: 'This is description of Samsung TV',
        price: 1500
    }),
    new Product({
        imagePath:  'https://content2.onliner.by/catalog/device/header@2/6c26e44e97020dbd90f0a7eee5e519a9.jpeg',
        title:'Ipad Pro 2019',
        description: 'This is description of Ipad Pro 2019',
        price: 850
    })
];

let done = 0;
for(let i=0; i<products.length; i++){
    products[i].save(function (err, result) {
        done++;
        if(done === products.length)
            exit();
    });
}

function exit() {
    mongoose.disconnect();
}