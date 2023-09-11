const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../util/send-mail');
const { validationResult } = require('express-validator');

const shopEmail = 'wibi.shop@nodejs.zun';

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash('error').at(0);
  res.render('auth/login', {
    title: 'Login',
    isAuthenticated: req.session.isAuthenticated,
    errorMessage: errorMessage,
    oldInput: { email: '' },
  });
};

exports.getReset = (req, res, next) => {
  const errorMessage = req.flash('error').at(0);
  res.render('auth/reset', {
    title: 'Reset Password',
    isAuthenticated: req.session.isAuthenticated,
    errorMessage: errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buf) => {
    const email = req.body.email;
    const token = buf.toString('hex');
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        req.flash('error', 'Invalid Email!');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.expiredResetToken = Date.now() + 1000 * 60 * 30;
      return user.save().then(() => {
        sendEmail(
          shopEmail,
          email,
          'Reset Your Password',
          `<h1>Hi! Here is Wibu Shop!</h1><p>You just sent a request to reset your password! :D</p><p>Here is the <a href="http://localhost:3000/reset/${token}">link</a> to reset your password :D (The link will be expired after 30 minutes)</p>`
        );
        return res.redirect('/reset');
      });
    });
  });
};

exports.getResetPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    expiredResetToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      req.flash('error', 'Your reset link is invalid now :(');
      return res.redirect('/login');
    }
    return res.render('auth/new-password', {
      title: 'Reset Password',
      userId: user._id.toString(),
      token: token,
    });
  });
};

exports.postResetPassword = (req, res, next) => {
  const token = req.body.token;
  // console.log(token);
  User.findOne({
    resetToken: token,
    expiredResetToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      req.flash('error', 'Your validation is unvalid!');
      return res.redirect('/login');
    }
    const password = req.body.password;
    return bcrypt.hash(password, 12).then((newPassword) => {
      user.password = newPassword;
      user.expiredResetToken = undefined;
      user.resetToken = undefined;
      return user.save().then(() => {
        res.redirect('/login');
      });
    });
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash('error').at(0);
  res.render('auth/signup', {
    title: 'Sign Up',
    isAuthenticated: req.session.isAuthenticated,
    errorMessage: errorMessage,
    oldInput: { email: '' },
  });
};

exports.postSignup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().at(0).msg;
    return res.status(422).render('auth/signup', {
      title: 'Sign Up',
      isAuthenticated: req.session.isAuthenticated,
      errorMessage: errorMessage,
      oldInput: { email: email },
    });
  }
  try {
    const cryptedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      password: cryptedPassword,
    });
    await newUser.save();
    res.redirect('/login');
    return sendEmail(
      shopEmail,
      email,
      'Sign Up Successful!',
      '<h1>Horayyyy! You have an account in our shop databse now! Welcome to Wibu Shop!!!!!</h1>'
    );
  } catch (err) {
    const error = new Error(err.message);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().at(0).msg;
    return res.status(422).render('auth/login', {
      title: 'Login',
      isAuthenticated: req.session.isAuthenticated,
      errorMessage: errorMessage,
      oldInput: { email: email },
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((value) => {
          if (!value) {
            req.flash('error', 'Invalid Password');
            return res.redirect('/login');
          }
          req.session.userId = user._id;
          req.session.isAuthenticated = true;
          return req.session.save((err) => {
            if (err) {
              console.error(err);
            }
            res.redirect('/');
          });
        })
        .catch((err) => {
          const error = new Error(err.message);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
