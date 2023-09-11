const Product = require('../models/product');
const { deleteFile } = require('../util/file');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    title: 'Add Product',
    page: '/admin/add-product',
    isAuthenticated: req.session.isAuthenticated,
    errorMessage: '',
    oldInput: {
      title: '',
      description: '',
      price: '',
    },
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imgUrl = req.file?.path;
  if (!imgUrl) {
    return res.render('admin/add-product', {
      title: 'Add Product',
      page: '/admin/add-product',
      isAuthenticated: req.session.isAuthenticated,
      errorMessage: errorMessage,
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
    });
  }

  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().at(0).msg;
    return res.render('admin/add-product', {
      title: 'Add Product',
      page: '/admin/add-product',
      isAuthenticated: req.session.isAuthenticated,
      errorMessage: errorMessage,
      oldInput: {
        title: title,
        description: description,
        price: price,
      },
    });
  }
  const product = new Product({
    title: title,
    imgUrl: imgUrl,
    price: price,
    description: description,
    userId: req.user._id,
  });
  product
    .save()
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render('admin/products', {
        title: 'Admin Products',
        products: products,
        page: '/admin/products',
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.id;
  Product.findOne({ _id: prodId, userId: req.user._id })
    .then((product) => {
      deleteFile(product.imgUrl);
      return product.deleteOne();
    })
    .then(() => {
      res.status(200).json({ message: 'Deleted!' });
    })
    .catch((err) => {
      res.status(500).json({ message: 'Delete Failed!' });
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.prodId;
  Product.findOne({ _id: prodId, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect('/admin/products');
      }
      return res.render('admin/edit-product', {
        title: 'Edit Product',
        product: product,
        page: '/admin/edit-product',
        isAuthenticated: req.session.isAuthenticated,
        errorMessage: '',
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  const title = req.body.title;
  const imgUrl = req.file?.path;
  const price = req.body.price;
  const description = req.body.description;
  Product.findOne({ _id: prodId, userId: req.user._id })
    .then((product) => {
      if (!product) {
        return res.redirect('/admin/products');
      }
      product.title = title;
      if (imgUrl) {
        deleteFile(product.imgUrl);
        product.imgUrl = imgUrl;
      }
      product.price = price;
      product.description = description;
      return product.save().then(() => {
        return res.redirect('/admin/products');
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};
