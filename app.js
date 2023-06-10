let createError = require('http-errors');
let express = require('express');
let path = require('path');
let flash = require('connect-flash');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let expressHbs = require('express-handlebars');
let session = require('express-session');
let indexRouter = require('./routes/index');
let userRouter = require('./routes/user');
let sql = require('mssql');

let app = express();

const config= {
  user: 'user1',
  password: '12345',
  server: '127.0.0.1',
  database: 'test1',
  port: 1433
};

sql.connect(config);
// view engine setup
  app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
  app.set('view engine', '.hbs');

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(cookieParser());
  app.use(session({
    secret: 'mysupersecret',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 180 * 60 * 1000}
  }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(flash());

  app.use('/user', userRouter);
  app.use('/', indexRouter);

// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
  });

// error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  module.exports = app;