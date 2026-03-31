const express = require("express");
const productController = require("./../controller/productController");
const authController = require("./../controller/authController");

const router = express.Router();

// Public routes - GET endpoints do NOT require authentication
// Route with regex to match MongoDB ObjectId (24 hex chars)
router.get("/:id([0-9a-fA-F]{24})", productController.getProduct);
// Route for slug-based lookups
router.get("/:slug", productController.getProductBySlug);
// Get all products
router.get("/", productController.getAllProducts);

// Protected routes - must add authController.protect to each protected route individually
router.post(
  "/",
  authController.protect,
  productController.uploadProductPhoto,
  productController.addPhotoToBody,
  productController.addProduct,
);
router.patch(
  "/:id",
  authController.protect,
  productController.uploadProductPhoto,
  productController.addPhotoToBody,
  productController.updateProduct,
);
router.patch(
  "/:id/visibility",
  authController.protect,
  productController.updateProductVisibility,
);
router.delete("/:id", authController.protect, productController.deleteProduct);

module.exports = router;
