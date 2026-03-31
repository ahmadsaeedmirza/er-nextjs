const express = require("express");
const appointmentController = require("./../controller/appointmentController");
const authController = require("./../controller/authController");

const router = express.Router();

// CUSTOMER ROUTES
router.post("/book", appointmentController.createAppointment);

// ADMIN ROUTES (Protected)
router.use(authController.protect);

router.route("/").get(appointmentController.getAllAppointments);

router
  .route("/:id")
  .get(appointmentController.getAppointment)
  .patch(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

module.exports = router;
