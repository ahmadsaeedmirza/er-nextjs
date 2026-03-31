const Order = require("./../model/orderModel");
const Product = require("./../model/productModel");
const factory = require("./factoryFunctions");
const catchAsync = require("./../utils/catchAsync");

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

  // C) Send response
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
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
