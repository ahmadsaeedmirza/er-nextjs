const express = require("express");
const Product = require("../model/productModel");

const router = express.Router();

// Get all cart items
router.get("/", (req, res) => {
  try {
    if (!req.session.cart) {
      req.session.cart = [];
    }
    res
      .status(200)
      .json({
        status: "success",
        data: req.session.cart,
        count: req.session.cart.length,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Add item to cart
router.post("/add", async (req, res) => {
  const { productId, name, price, image, detail, quantity } = req.body;

  try {
    // Fetch product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    const requestedQuantity = quantity || 1;

    // Check stock
    if (product.stockQuantity < requestedQuantity) {
      return res
        .status(400)
        .json({ status: "error", message: "Not enough stock available" });
    }

    if (!req.session.cart) req.session.cart = [];

    // Check if product already exists
    const existingItem = req.session.cart.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      // Check if adding more would exceed stock
      if (existingItem.quantity + requestedQuantity > product.stockQuantity) {
        return res
          .status(400)
          .json({ status: "error", message: "Not enough stock available" });
      }
      existingItem.quantity += requestedQuantity;
    } else {
      req.session.cart.push({
        productId,
        name,
        price,
        image,
        detail,
        quantity: requestedQuantity,
      });
    }

    res
      .status(200)
      .json({
        status: "success",
        count: req.session.cart.length,
        data: req.session.cart,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Update quantity
router.post("/update-quantity", async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    if (!req.session.cart) req.session.cart = [];

    const item = req.session.cart.find((i) => i.productId === productId);
    if (!item) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found in cart" });
    }

    // Fetch product to check stock
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      return res
        .status(400)
        .json({ status: "error", message: "Not enough stock available" });
    }

    if (quantity <= 0) {
      req.session.cart = req.session.cart.filter(
        (i) => i.productId !== productId,
      );
    } else {
      item.quantity = quantity;
    }

    res
      .status(200)
      .json({
        status: "success",
        data: req.session.cart,
        count: req.session.cart.length,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Remove item from cart
router.post("/remove", (req, res) => {
  const { productId } = req.body;

  if (!req.session.cart) req.session.cart = [];

  // Remove item from cart
  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId,
  );

  res
    .status(200)
    .json({
      status: "success",
      count: req.session.cart.length,
      data: req.session.cart,
    });
});

module.exports = router;
