const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imgUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);

// const mongodb = require('mongodb');
// const { getDb } = require('../util/database');
// const User = require('./user');

// module.exports = class Product {
//   constructor(title, imgUrl, price, description, id, userId) {
//     this.title = title;
//     this.imgUrl = imgUrl;
//     this.price = price;
//     this.description = description;
//     this._id = id ? new mongodb.ObjectId(id) : undefined;
//     this.userId = new mongodb.ObjectId(userId);
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       dbOp = db.collection('products').updateOne(
//         { _id: this._id },
//         {
//           $set: this,
//         }
//       );
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp.catch((err) => {
//       console.log(err);
//     });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then((product) => product)
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return User.fetchAll()
//       .then((users) => {
//         users.forEach((u) => {
//           const user = new User(u.username, u.email, u.cart, u._id);
//           user.deleteCart(prodId);
//         });
//         return users;
//       })
//       .then(() => {
//         return db
//           .collection('products')
//           .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//           .catch((err) => {
//             console.log(err);
//           });
//       });
//   }
// };
