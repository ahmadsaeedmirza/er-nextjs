const express = require("express");
const authController = require("./../controller/authController");
const dashboardController = require("./../controller/dashboardController");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.layout = "adminBase";
  next();
});

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router.use(authController.protect);

router.get("/me", authController.me);
router.post("/verifyPassword", authController.verifyPassword);
router.patch("/updateMyPassword", authController.updatePassword);
router.get("/dashboard-stats", dashboardController.getDashboardStats);

module.exports = router;
