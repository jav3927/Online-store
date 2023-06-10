let passport = require('passport');
let User = require('../models/user');
let dbModule = require('mssql/dbModule');
let LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    dbModule.findUserById(id).then( function (err,user) {
        done(err, user);
    })
});

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    dbModule.findUserByEmail(email).then(function (res, user) {
        if(res == 0){
            return done('error');
        }
        if(res == 1){
            return done(null, false, {message: 'Email is already in use.'})
        }
    })
}));