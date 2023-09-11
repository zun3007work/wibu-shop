const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    body('email', 'Invalid Email!')
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject('Email does not exists!');
        }
      }),
    body('password', 'Invalid Password!')
      .trim()
      .isStrongPassword()
      .isLength({ min: 6 }),
  ],
  authController.postLogin
);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    body('email', 'Invalid Email!')
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Email exists!');
        }
      }),
    body('password', 'Invalid Password!')
      .trim()
      .isStrongPassword()
      .isLength({ min: 6 }),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Invalid Confirmed Passowrd!');
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getResetPassword);

router.post('/new-password', authController.postResetPassword);

module.exports = router;
