const Order = require("./../model/orderModel");
const Product = require("./../model/productModel");
const factory = require("./factoryFunctions");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/email");

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

  // D) Send Order Confirmation Email
  try {
    const orderDetails = await Order.findById(newOrder._id).populate("items.product");
    
    const itemsHtml = orderDetails.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${item.product.name} (x${item.quantity})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: #333;">$${(item.product.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("");

    const totalPriceHtml = `
      <tr>
        <td style="padding: 10px; font-weight: bold; color: #CF1745;">Total Price</td>
        <td style="padding: 10px; font-weight: bold; text-align: right; color: #CF1745;">$${orderDetails.totalPrice.toFixed(2)}</td>
      </tr>
    `;

    const message = `Hi ${newOrder.customerName}, we have received your order! You can pick up your order any time at our salon during our opening hours.`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Confirmation</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background-color:#CF1745;padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">E&R Salon</h1>
          <p style="margin:8px 0 0;color:#f9b3c4;font-size:14px;">Professional Beauty Services & Products</p>
        </td></tr>
        <!-- Hero Banner -->
        <tr><td style="background-color:#fdf0f3;padding:28px 40px;text-align:center;border-bottom:3px solid #CF1745;">
          <div style="display:inline-block;background:#CF1745;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;color:#ffffff;">✓</div>
          <h2 style="margin:16px 0 4px;color:#CF1745;font-size:22px;">Order Received!</h2>
          <p style="margin:0;color:#666;font-size:15px;">Your order is ready for in-store pickup.</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;color:#333;font-size:15px;">Dear <strong>${newOrder.customerName}</strong>,</p>
          <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">Thank you for your purchase! We have successfully received your order. You can pick up your items at our salon at any time during our business hours listed below.</p>
          
          <!-- Order Summary Card -->
          <h3 style="color:#CF1745;font-size:16px;margin:0 0 12px;border-bottom:1px solid #eee;padding-bottom:8px;">Order Details</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;font-size:14px;">
            ${itemsHtml}
            ${totalPriceHtml}
          </table>

          <!-- Pickup Location Card -->
          <h3 style="color:#CF1745;font-size:16px;margin:0 0 12px;border-bottom:1px solid #eee;padding-bottom:8px;">Pickup Location</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:6px;border:1px solid #e8e8e8;margin-bottom:28px;font-size:14px;">
            <tr>
              <td style="padding:14px 20px;">
                <strong style="color:#222;">E&R Salon</strong><br />
                <span style="color:#555;line-height:1.6;">
                  3180 Colima Rd Suite F,<br />
                  Hacienda Heights, CA 91745
                </span>
                <br /><br />
                <span style="color:#888;font-size:12px;">Reservation Desk:</span> <span style="color:#222;font-weight:bold;">+1 (626) 333-6814</span>
                <br /><br />
                <a href="https://maps.app.goo.gl/QrYeabnGPKS1rkV6A" target="_blank" style="display:inline-block;background:#CF1745;color:#ffffff;text-decoration:none;padding:8px 16px;border-radius:4px;font-size:13px;font-weight:bold;">Open with Maps</a>
              </td>
            </tr>
          </table>

          <!-- Salon Hours Card -->
          <h3 style="color:#CF1745;font-size:16px;margin:0 0 12px;border-bottom:1px solid #eee;padding-bottom:8px;">Salon Business Hours</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;font-size:14px;color:#555;line-height:1.6;">
            <tr><td style="padding:4px 0;"><strong>Monday - Wednesday:</strong></td><td align="right">09:00 AM - 05:00 PM</td></tr>
            <tr><td style="padding:4px 0;"><strong>Thursday:</strong></td><td align="right">09:00 AM - 06:30 PM</td></tr>
            <tr><td style="padding:4px 0;"><strong>Friday:</strong></td><td align="right">08:00 AM - 06:30 PM</td></tr>
            <tr><td style="padding:4px 0;"><strong>Saturday:</strong></td><td align="right">08:00 AM - 05:00 PM</td></tr>
            <tr><td style="padding:4px 0;"><strong>Sunday:</strong></td><td align="right">09:00 AM - 02:00 PM</td></tr>
          </table>

          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">Please have your order confirmation email or order name handy when you arrive for pickup. If you have any questions, feel free to call us.</p>
          <div style="text-align:center;margin-bottom:8px;">
            <a href="tel:+16263336814" style="display:inline-block;background:#CF1745;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:4px;font-size:15px;font-weight:bold;">Call Salon</a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#f4f4f4;padding:24px 40px;text-align:center;border-top:1px solid #e8e8e8;">
          <p style="margin:0 0 6px;color:#888;font-size:13px;">© ${new Date().getFullYear()} E&R Salon. All rights reserved.</p>
          <p style="margin:0;color:#aaa;font-size:12px;">You received this email because you placed an order with E&R Salon.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail({
      email: newOrder.customerEmail,
      subject: "Order Confirmation – E&R Salon",
      message,
      html,
    });
  } catch (err) {
    console.error("Order confirmation email failed to send:", err);
  }

  // Clear cart in session
  if (req.session) {
    req.session.cart = [];
  }

  // E) Send response
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
