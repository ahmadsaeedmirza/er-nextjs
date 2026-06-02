const path = require("path");
const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
// const appointmentController = require("./controller/appointmentController");
const appointmentRouter = require("./routes/appointmentRoutes");
const orderRouter = require("./routes/orderRoutes");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const cartRouter = require("./routes/cartRoutes");

// console.log('DB string is', process.env.DATABASE);

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);

// app.enable('trust proxy');
app.set("trust proxy", 1);

app.set("views", path.join(__dirname, "views"));

// SERVING STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// 1 - Global MIDDLEWARES
// IMPLEMENT CORS (ALLOW CROSS SERVER REQUESTS)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
];
if (process.env.FRONTEND_URL) {
  // Support both trailing slash and non-trailing slash origins
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// SET SECURITY HTTP HEADERS
// app.use(helmet());
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       baseUri: ["'self'"],
//       fontSrc: [
//         "'self'",
//         "https:",
//         "data:",
//         "https://fonts.googleapis.com",
//         "https://ka-f.fontawesome.com", // ✅ Allow Font Awesome fonts
//       ],
//       scriptSrc: [
//         "'self'",
//         "https://api.mapbox.com",
//         "https://cdnjs.cloudflare.com",
//         "https://js.stripe.com",
//         "https://kit.fontawesome.com", // ✅ Font Awesome Kit
//       ],
//       styleSrc: [
//         "'self'",
//         "'unsafe-inline'", // Needed for some Font Awesome in-kit styles
//         "https://api.mapbox.com",
//         "https://fonts.googleapis.com",
//         "https://ka-f.fontawesome.com", // ✅ Font Awesome CSS
//       ],
//       connectSrc: [
//         "'self'",
//         "https://*.tiles.mapbox.com",
//         "https://api.mapbox.com",
//         "https://events.mapbox.com",
//         "https://js.stripe.com",
//         "ws://localhost:*",
//         "ws://127.0.0.1:*",
//         "https://ka-f.fontawesome.com", // ✅ Font Awesome CDN
//       ],
//       imgSrc: [
//         "'self'",
//         "data:",
//         "blob:",
//         "https://api.mapbox.com",
//         "https://*.tiles.mapbox.com",
//       ],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: ["'none'"],
//       frameSrc: ["'self'", "https://js.stripe.com"],
//     },
//   }),
// );

// DEVELOPMENT LOGGING
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// const limiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use("/api", limiter);

// app.post(
//   "/webhook-checkout",
//   express.raw({ type: "application/json" }),
//   bookingController.webhookCheckouts,
// );

// BODY PARSER (READING DATA FROM BODY INTO REQ.BODY)
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingAverage",
      "ratingQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

app.use(compression());

// MIDDLEWARE TO TRACK USER
app.use((req, res, next) => {
  res.locals.currentUrl = req.originalUrl;
  next();
});

// HANDELING CART INFO GLOBALLY
app.use((req, res, next) => {
  if (!req.session) {
    return next(); // Prevent crash if session failed
  }
  req.session.cart = req.session.cart || [];
  res.locals.cartItems = req.session.cart;
  res.locals.cartCount = req.session.cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  next();
});

// 2 - ROUTES
// API routes FIRST (before any other routers that might apply middleware)
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/appointments", appointmentRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/admin", userRouter);
app.use("/api/cart", cartRouter);

app.all("/*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this site`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
