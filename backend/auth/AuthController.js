const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const User = require('../user/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const config = require('../config/application');
const AuthService = require('./AuthService');
const path = require('path');

router.post('/login', (req, res) => {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }
        req.logIn(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            const token = AuthService.issueToken(user._id);
            return res.status(200).send({user, token});
        });
    })(req, res);
});

router.get('/me', AuthService.authRequired, (req, res) => {
    return res.status(200).send(req.user);
 });

//########### Google OAuth ###########//
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/error' }),
    function(req, res) {
        console.log("google callback received..");
        // Successful authentication, redirect success.
        const accessToken = AuthService.issueToken(req.user.id);
        if(accessToken) {
            console.log(`[GoogleOAuth]: Token issued for the user: ${req.user.id}`);
        } else {
            console.error(`[GoogleOAuth]: Token has not been issued for the user: ${req.user.id}`);
        }
        console.log(req.user);
        delete req.user['_raw'];
        console.log(req.user);

        res.render(path.join(__dirname + '/authenticated.html'), {
            user: JSON.stringify({user: req.user, token: accessToken}),
            targetOrigin: config.client.url
        });
    }
);

router.get(config.google.callbackURL.replace('/api/auth',''), 
           passport.authenticate('google',{session: false}), 
           function(req, res) {
    const accessToken = AuthService.issueToken(req.user._id);
    if(accessToken) {
        console.log(`[GoogleOAuth]: Token issued for the user: ${req.user._id}`);
    } else {
        console.error(`[GoogleOAuth]: Token has not been issued for the user: ${req.user._id}`);
    }
    res.render(path.join(__dirname + '/authenticated.html'), {
        user: JSON.stringify({user: req.user, token: accessToken}),
        targetOrigin: config.client.url
    });
});

//########### polygon OAuth ###########//
router.get('/polygon', passport.authenticate('polygon', {
    session: false,
    scope: [ 'email']
}));

module.exports = router;