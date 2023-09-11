const express = require('express');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');

const router = express.Router();

// Middleware to check if the user is authenticated
router.use(isAuth);

router.get('/add-product', adminController.getAddProduct);

router.post(
  '/add-product',
  [
    body('title', 'Invalid Title').trim().notEmpty(),
    body('price', 'Invalid Price').isFloat(),
    body('description').trim(),
  ],
  adminController.postAddProduct
);

router.get('/products', adminController.getAdminProducts);

router.delete('/product/:id', adminController.deleteProduct);

router.get('/edit-product/:prodId', adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

module.exports = router;
