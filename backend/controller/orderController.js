const Order = require("./../model/orderModel");
const Product = require("./../model/productModel");
const factory = require("./factoryFunctions");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

// 1. GUEST CHECKOUT: Create Order & Update Stock
exports.createOrder = catchAsync(async (req, res, next) => {
  // A) Create the order (req.body will contain customerName, customerEmail, items, etc.)
  const newOrder = await Order.create(req.body);

  // B) Update stock for each product in the order
  const updateStockPromises = newOrder.items.map(async (item) => {
    return await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity },
    });
  });

  await Promise.all(updateStockPromises);

  // C) Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("orderCreated", newOrder);
  }

  // D) Send response
  res.status(201).json({
    status: "success",
    data: {
      order: newOrder,
    },
  });
});

// 2. ADMIN ONLY: Standard Functions (These still need protection!)
exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order, { path: "items.product" });

exports.updateOrder = catchAsync(async (req, res, next) => {
  const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedOrder) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("orderUpdated", updatedOrder);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: updatedOrder,
    },
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);

  if (!deletedOrder) {
    return next(new AppError("No order found with that ID", 404));
  }

  // Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("orderDeleted", req.params.id);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
