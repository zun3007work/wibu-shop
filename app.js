const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBConnect = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const compression = require('compression');

const fileStorage = multer.diskStorage({
  destination: 'images',
  filename: (req, file, callback) => {
    callback(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  }
  cb(null, false);
};

const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).single(
  'image'
);

const csrfProtection = csurf();

app.use(compression());

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorRoutes = require('./routes/error');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://ntdung30072003:s6fetJwYaexhYRSZ@nodecomplete.bclcjns.mongodb.net/shop';

const store = new MongoDBConnect({ uri: MONGODB_URI, collection: 'sessions' });

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret:
      'this is my application with a slime cat and a water cat ears and a wibu book and why its so many and in this one text',
    saveUninitialized: false,
    resave: false,
    store: store,
    cookie: { maxAge: 60 * 60 * 24 * 1000 },
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  User.findById(req.session.userId)
    .then((user) => {
      if (user) {
        req.user = user;
      }
      next();
    })
    .catch((err) => {
      return res.status(500).render('500', {
        title: '500 Something went wrong!',
        page: '500',
      });
    });
});

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);

// Error Handling Routes
app.use(errorRoutes);

app.use((error, req, res, next) => {
  // console.log(error);
  return res.redirect('/500');
});

// Connect to database!
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000, () => {
      // console.log(`Server is running at http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
