const Appointment = require("./../model/appointmentModel");
const Order = require("./../model/orderModel");
const Product = require("./../model/productModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { addProduct } = require("./productController");

exports.getOverview = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isHidden: { $ne: true } });
  console.log("Rendering overview page...");
  res.status(200).render("overview", {
    products,
    title: "Home",
  });
});

exports.getServices = catchAsync(async (req, res, next) => {
  console.log("Rendering services page...");
  res.status(200).render("services");
});

exports.getProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isHidden: { $ne: true } });
  console.log("Rendering products page...");
  res.status(200).render("products", {
    products,
    title: "Our Products",
  });
});

exports.getOneProduct = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const product = await Product.findOne({ slug, isHidden: { $ne: true } });
  if (!product) {
    return next(new AppError("There is no product with that name", 404));
  }
  console.log("Rendering one product page...");
  res.status(200).render("productOne", {
    title: `${product.name}`,
    product,
  });
});

exports.getAppointmentBookingPage = catchAsync(async (req, res, next) => {
  console.log("Rendering appointment page...");
  res.status(200).render("appointment", {
    title: "Book an Appointment",
    selectedService: req.query.service,
  });
});

exports.getContactUs = catchAsync(async (req, res, next) => {
  console.log("Rendering contact us page...");
  res.status(200).render("contactus");
});

exports.getCart = catchAsync(async (req, res, next) => {
  console.log("Rendering cart page...");
  // console.log("CART DEBUG:", req.session.cart);
  res.status(200).render("cart", {
    title: "Your Shopping Cart",
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  console.log("Rendering login page...");
  res.status(200).render("login");
});

exports.getDashboard = catchAsync(async (req, res, next) => {
  console.log("Rendering dashboard page...");
  res.status(200).render("dashboard", {
    title: "Dashboard",
  });
});

exports.getManageOrder = catchAsync(async (req, res, next) => {
  console.log("Rendering orders page...");
  res.status(200).render("manageOrders");
});

exports.getManageProducts = catchAsync(async (req, res, next) => {
  console.log("Rendering Products page...");
  const products = await Product.find();
  res.status(200).render("manageProducts", {
    products,
    title: "Manage Products",
  });
});

exports.getManageAppointments = catchAsync(async (req, res, next) => {
  console.log("Rendring Appointments page...");
  res.status(200).render("manageAppointments");
});

exports.getEditProduct = catchAsync(async (req, res, next) => {
  console.log("Rendering Edit Product Page...");
  let product = null;
  if (req.query.id) {
    product = await Product.findById(req.query.id);
    if (!product)
      return next(new AppError("No product found with that ID", 404));
  }
  res.status(200).render("addEditProduct", {
    product,
    title: product ? "Edit Product" : "Add Product",
    adminEmail: req.user ? req.user.email : "",
  });
});
