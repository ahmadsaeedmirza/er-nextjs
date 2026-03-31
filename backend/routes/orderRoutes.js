const express = require("express");
const orderController = require("./../controller/orderController");
const authController = require("./../controller/authController");

const router = express.Router();

// CUSTOMER ROUTE
router.post("/checkout", orderController.createOrder);

// ADMIN ROUTES (Protected)
router.use(authController.protect);

router.get("/", orderController.getAllOrders);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
