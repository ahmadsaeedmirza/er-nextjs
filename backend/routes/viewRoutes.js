const express = require("express");
const authController = require("./../controller/authController");
const viewController = require("./../controller/viewController");

const router = express.Router();

router.get("/", viewController.getOverview);
router.get("/services", viewController.getServices);
router.get("/products", viewController.getProducts);
router.get("/products/:slug", viewController.getOneProduct);
router.get("/bookAppointment", viewController.getAppointmentBookingPage);
router.get("/contactUs", viewController.getContactUs);
router.get("/cart", viewController.getCart);

// ADMIN ROUTES
router.get("/login", viewController.getLoginForm);

router.use(authController.protect);

router.get("/dashboard", viewController.getDashboard);
router.get("/manageOrders", viewController.getManageOrder);
router.get("/manageProducts", viewController.getManageProducts);
router.get("/manageAppointments", viewController.getManageAppointments);
router.get("/editProduct", viewController.getEditProduct);

module.exports = router;
