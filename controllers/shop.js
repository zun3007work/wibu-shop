// Import
const fs = require('fs');
const path = require('path');
const pdfkit = require('pdfkit');
const stripe = require('stripe')(
  'sk_test_51Nbjr6Ku7weUE6lkqwDiNTFSEK2zz70NnboMhXP3J8lPEpAhuwx0qrVQATOrGlc0i1wYtDbCGaLs3wDY6dWPHnSN00jxogYXkQ'
);

// Model
const Order = require('../models/order');
const Product = require('../models/product');
const product = require('../models/product');

// Define
const ITEMS_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
  let page = +req.query.page;
  if (!page) {
    page = 1;
  }
  Product.find()
    .countDocuments()
    .then(async (amount) => {
      const pageAmount = Math.ceil(amount / ITEMS_PER_PAGE);
      let shortForm = false;
      let pageStart;
      let pageEnd;

      if (pageAmount >= 5) {
        shortForm = true;
      }

      if (shortForm) {
        if (page === 1 || page === 2) {
          pageStart = 1;
          pageEnd = 3;
        } else if (page === pageAmount || page === pageAmount - 1) {
          pageStart = pageAmount - 2;
          pageEnd = pageAmount;
        } else {
          pageStart = page - 1;
          pageEnd = page + 1;
        }
      }

      const products = await Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      res.render('shop/index', {
        title: 'Shop',
        products: products,
        page: '/',
        isAuthenticated: req.session.isAuthenticated,
        pageAmount: pageAmount,
        currentPage: page,
        shortForm: shortForm,
        pageStart: pageStart,
        pageEnd: pageEnd,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProductList = (req, res, next) => {
  let page = +req.query.page;
  if (!page) {
    page = 1;
  }
  Product.find()
    .countDocuments()
    .then(async (amount) => {
      const pageAmount = Math.ceil(amount / ITEMS_PER_PAGE);
      let shortForm = false;
      let pageStart;
      let pageEnd;

      if (pageAmount >= 5) {
        shortForm = true;
      }

      if (shortForm) {
        if (page === 1 || page === 2) {
          pageStart = 1;
          pageEnd = 3;
        } else if (page === pageAmount || page === pageAmount - 1) {
          pageStart = pageAmount - 2;
          pageEnd = pageAmount;
        } else {
          pageStart = page - 1;
          pageEnd = page + 1;
        }
      }

      const products = await Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      res.render('shop/product-list', {
        title: 'Products',
        products: products,
        page: '/products',
        isAuthenticated: req.session.isAuthenticated,
        pageAmount: pageAmount,
        currentPage: page,
        shortForm: shortForm,
        pageStart: pageStart,
        pageEnd: pageEnd,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user.createOrder().then(() => {
    res.redirect('/order');
  });
};

exports.getOrder = (req, res, next) => {
  Order.find({ userId: req.user._id }).then((orders) => {
    res.render('shop/order', {
      orders: orders,
      page: '/order',
      title: 'Orders',
      isAuthenticated: req.session.isAuthenticated,
    });
  });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.prodId;
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-details', {
        page: '/details',
        title: `${product.title} Details`,
        product: product,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
      res.render('shop/cart', {
        page: '/cart',
        title: 'Cart',
        products: products,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let totalSum;
  let products;
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      products = user.cart.items;
      totalSum = products.reduce(
        (prev, prod) => prev + prod.quantity * prod.productId.price,
        0
      );
      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((prod) => {
          return {
            quantity: prod.quantity,
            price_data: {
              currency: 'usd',
              unit_amount: prod.productId.price * 100,
              product_data: {
                name: prod.productId.title,
              },
            },
          };
        }),
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
      });
    })
    .then((session) => {
      res.render('shop/checkout', {
        page: '/checkout',
        title: 'Checkout',
        products: products,
        isAuthenticated: req.session.isAuthenticated,
        totalSum,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.prodId;
  req.user
    .deleteCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err.message);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoices = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return res.redirect('/order');
      }
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/order');
      }
      const fileName = `invoice-${orderId}.pdf`;
      const filePath = path.join('data', 'invoices', fileName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      const pdfDoc = new pdfkit();
      pdfDoc.pipe(fs.createWriteStream(filePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(30).text('Invoice', { underline: true, lineGap: 30 });
      const totalPrice = order.items.reduce(
        (total, prod) => total + prod.quantity * prod.product.price,
        0
      );
      order.items.forEach((prod) => {
        pdfDoc
          .fontSize(18)
          .text(
            `${prod.product.title}: ${prod.quantity} x $${prod.product.price}`
          );
      });
      pdfDoc.fontSize(30).text('__________________________');
      pdfDoc.fontSize(24).text(`Total: $${totalPrice}`);
      pdfDoc.end();
      // fs.readFile(filePath, (error, data) => {
      //   if (error) {
      //     return next(error);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     `attachment; filename="${fileName}"`
      //   );
      //   res.send(data);
      // });
    })
    .catch((err) => {
      return next(err);
    });
};
