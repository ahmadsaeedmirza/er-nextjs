const mongoose = require("mongoose");
const validator = require("validator");
const { validate } = require("./productModel");
const Product = require("./productModel");

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, "who is buying this?"],
    trim: true,
  },
  customerEmail: {
    type: String,
    required: [true, "Email field is required"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Pending",
  },
  paid: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
