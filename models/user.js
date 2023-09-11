const mongoose = require('mongoose');
const Order = require('./order');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  expiredResetToken: Date,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  let newQuantity = 1;
  let newCart = this.cart;
  const productIndex = newCart.items.findIndex(
    (item) => item.productId.toString() === product._id.toString()
  );
  if (productIndex >= 0) {
    newCart.items.at(productIndex).quantity += newQuantity;
  } else {
    newCart.items.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  this.cart = newCart;
  return this.save();
};

userSchema.methods.deleteCart = function (prodId) {
  const newCart = {
    items: this.cart.items.filter(
      (item) => item.productId.toString() !== prodId.toString()
    ),
  };
  this.cart = newCart;
  return this.save();
};

userSchema.methods.createOrder = function () {
  return this.populate('cart.items.productId')
    .then((user) => {
      const cartItems = user.cart.items;
      const orderItems = cartItems.map((p) => {
        return {
          product: { title: p.productId.title, price: p.productId.price },
          quantity: p.quantity,
        };
      });
      const order = new Order({
        userId: this,
        items: orderItems,
      });
      return order.save();
    })
    .then(() => {
      const resetCart = { items: [] };
      this.cart = resetCart;
      return this.save();
    });
};

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const { getDb } = require('../util/database');

// module.exports = class User {
//   constructor(username, email, cart, id) {
//     this.username = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id ? new mongodb.ObjectId(id) : undefined;
//   }

//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }

//   addToCart(product) {
//     let newQuantity = 1;
//     let newCart = this.cart;
//     const productIndex = newCart.items.findIndex(
//       (item) => item.productId.toString() === product._id.toString()
//     );
//     if (productIndex >= 0) {
//       newCart.items.at(productIndex).quantity += newQuantity;
//     } else {
//       newCart.items.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: newQuantity,
//       });
//     }
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne({ _id: this._id }, { $set: { cart: newCart } })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   getCart() {
//     const productIndexs = this.cart.items.map((item) => item.productId);
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: { $in: productIndexs } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(
//               (item) => item.productId.toString() === product._id.toString()
//             ).quantity,
//           };
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   deleteCart(prodId) {
//     const newCart = {
//       items: this.cart.items.filter(
//         (item) => item.productId.toString() !== prodId.toString()
//       ),
//     };
//     const db = getDb();
//     return db
//       .collection('users')
//       .updateOne({ _id: this._id }, { $set: { cart: newCart } })
//       .catch((err) => {
//         console.log();
//       });
//   }

//   createOrder() {
//     const db = getDb();
//     this.getCart()
//       .then((products) => {
//         const order = {
//           products: products,
//           user: {
//             _id: this._id,
//             username: this.username,
//           },
//         };
//         return order;
//       })
//       .then((order) => {
//         return db.collection('orders').insertOne(order);
//       })
//       .then(() => {
//         this.cart = { items: [] };
//         return db
//           .collection('users')
//           .updateOne({ _id: this._id }, { $set: { cart: this.cart } });
//       })
//       .catch((err) => console.log(err));
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection('orders')
//       .find({ 'user._id': this._id })
//       .toArray()
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(userID) {
//     const db = getDb();
//     return db
//       .collection('users')
//       .find({ _id: new mongodb.ObjectId(userID) })
//       .next()
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection('users').find().toArray();
//   }
// };
