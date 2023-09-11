const express = require('express');

const isAuth = require('../middleware/is-auth');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/', shopController.getProducts);

router.get('/products', shopController.getProductList);

router.get('/cart', isAuth, shopController.getCart);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.postOrder);

router.get('/checkout/cancel', isAuth, shopController.getCheckout);

router.get('/details/:prodId', shopController.getProductDetails);

router.get('/order', isAuth, shopController.getOrder);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart/delete', isAuth, shopController.postDeleteCart);

router.get('/invoices/:orderId', isAuth, shopController.getInvoices);

module.exports = router;
