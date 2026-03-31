const Order = require("./../model/orderModel");
const Appointment = require("./../model/appointmentModel");
const Product = require("./../model/productModel");
const catchAsync = require("./../utils/catchAsync");

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const [orders, appointments, products] = await Promise.all([
    Order.find().sort("-createdAt").lean(),
    Appointment.find().sort("-createdAt").lean(),
    Product.find().lean(),
  ]);

  const nonCancelledOrders = orders.filter(
    (order) => order.status !== "Cancelled",
  );
  const totalSales = nonCancelledOrders.reduce(
    (sum, order) => sum + Number(order.totalPrice || 0),
    0,
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending" || order.status === "Processing",
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped",
  ).length;

  const pendingAppointments = appointments.filter(
    (appointment) => appointment.status === "Pending",
  ).length;

  const averageOrderValue = nonCancelledOrders.length
    ? totalSales / nonCancelledOrders.length
    : 0;

  const orderStatusCounts = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ].map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));

  const recentOrders = orders.slice(0, 6).map((order) => ({
    id: order._id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    status: order.status,
    totalPrice: Number(order.totalPrice || 0),
    itemCount: (order.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    ),
    createdAt: order.createdAt,
  }));

  const recentAppointments = appointments.slice(0, 6).map((appointment) => ({
    id: appointment._id,
    customerName: appointment.customerName,
    customerEmail: appointment.customerEmail,
    service: appointment.service,
    status: appointment.status,
    appointmentDate: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
  }));

  const now = new Date();
  const trendMonths = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    trendMonths.push(date);
  }

  const trendMap = new Map(
    trendMonths.map((date) => [
      monthKey(date),
      {
        label: monthLabel(date),
        sales: 0,
        orders: 0,
      },
    ]),
  );

  nonCancelledOrders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const key = monthKey(createdAt);
    const existing = trendMap.get(key);
    if (existing) {
      existing.sales += Number(order.totalPrice || 0);
      existing.orders += 1;
    }
  });

  const salesTrend = trendMonths.map((date) => trendMap.get(monthKey(date)));

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );
  const topProductMap = new Map();

  nonCancelledOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const productId = String(item.product || "");
      if (!productId) {
        return;
      }

      const product = productMap.get(productId);
      const quantity = Number(item.quantity || 0);
      const existing = topProductMap.get(productId) || {
        id: productId,
        name: product?.name || "Product",
        quantitySold: 0,
        revenue: 0,
      };

      existing.quantitySold += quantity;
      existing.revenue += Number(product?.price || 0) * quantity;
      topProductMap.set(productId, existing);
    });
  });

  const topProducts = Array.from(topProductMap.values())
    .sort((left, right) => right.quantitySold - left.quantitySold)
    .slice(0, 5);

  res.status(200).json({
    status: "success",
    data: {
      totals: {
        totalSales,
        totalOrders: orders.length,
        pendingOrders,
        shippedOrders,
        totalAppointments: appointments.length,
        pendingAppointments,
        totalProducts: products.length,
        averageOrderValue,
      },
      salesTrend,
      orderStatusCounts,
      recentOrders,
      recentAppointments,
      topProducts,
    },
  });
});
