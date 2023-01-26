const express = require('express');
const mustacheExpress = require('mustache-express');
const cors = require('cors');
const passport = require('passport');

require('./db');
require('./config/passport/ploygon.setup');
require('./config/passport/google.setup');
require('./config/passport/jwt.setup');
require('./config/passport/local.setup');

const app = express();

const UserController = require('./user/UserController');
const AuthController = require('./auth/AuthController');

app.engine('html', mustacheExpress());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cors());
app.use('/api/users', UserController);
app.use('/api/auth', AuthController);

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

module.exports = app;