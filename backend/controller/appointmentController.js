const Appointment = require("./../model/appointmentModel");
const factory = require("./factoryFunctions");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { google } = require("googleapis");
const dotenv = require("dotenv");
const sendEmail = require("./../utils/email");

// 1. Setup Google Calendar Auth
const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account.json",
  scopes: ["https://www.googleapis.com/auth/calendar"],
});
const calendar = google.calendar({ version: "v3", auth });

// 2. GUEST BOOKING: Create Appointment + Google Calendar
exports.createAppointment = catchAsync(async (req, res, next) => {
  // A) Create Appointment in MongoDB
  const newAppointment = await Appointment.create(req.body);

  // B) Create Google Calendar Event
  const startDateTime = new Date(
    `${req.body.appointmentDate}T${req.body.timeSlot}:00`,
  );
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  // Basic validation to ensure date/time strings are valid
  if (isNaN(startDateTime.getTime())) {
    return next(new AppError("Invalid date or time format provided", 400));
  }

  const event = {
    summary: `Salon Appointment: ${newAppointment.customerName}`,
    description: `Contact Number: ${newAppointment.whatsappNumber}`, // Kept as a text field in the calendar
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: "America/New_York",
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: "America/New_York",
    },
  };

  try {
    const gCalEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDER_ID,
      resource: event,
    });

    // Update the appointment with the Google Event ID for future management
    newAppointment.googleEventId = gCalEvent.data.id;
    await newAppointment.save();
  } catch (err) {
    console.error("Google Calendar Error: ", err);
    // We don't fail the request if the calendar sync fails, but we log it
  }

  // C) Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("appointmentCreated", newAppointment);
  }

  // D) Success Response
  res.status(201).json({
    status: "success",
    data: {
      appointment: newAppointment,
    },
  });
});

// CUSTOM UPDATE APPOINTMENT STATUS FUNCTION TO SEND EMAIL AS APPOINTMENT STATUS CHANGES
exports.updateAppointment = catchAsync(async (req, res, next) => {
  // 1. Find the appointment first
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }

  // 2. Check if the status is being updated
  const oldStatus = appointment.status;
  const newStatus = req.body.status;

  // 3. Update the data
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  // 4. If status changed, send email
  if (newStatus && oldStatus !== newStatus) {
    try {
      let message;
      let html;

      if (newStatus === "Confirmed") {
        message = `Hi ${updatedAppointment.customerName}, your appointment for ${updatedAppointment.appointmentDate} at ${updatedAppointment.timeSlot} has been CONFIRMED. Thank you for choosing E&R Salon!`;
        html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Appointment Confirmed</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background-color:#CF1745;padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">E&R Salon</h1>
          <p style="margin:8px 0 0;color:#f9b3c4;font-size:14px;">Professional Beauty Services</p>
        </td></tr>
        <!-- Hero Banner -->
        <tr><td style="background-color:#fdf0f3;padding:28px 40px;text-align:center;border-bottom:3px solid #CF1745;">
          <div style="display:inline-block;background:#CF1745;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;">✓</div>
          <h2 style="margin:16px 0 4px;color:#CF1745;font-size:22px;">Appointment Confirmed!</h2>
          <p style="margin:0;color:#666;font-size:15px;">We're looking forward to seeing you.</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;color:#333;font-size:15px;">Hi <strong>${updatedAppointment.customerName}</strong>,</p>
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">Great news! Your appointment has been <strong style="color:#CF1745;">confirmed</strong>. Please see the details below:</p>
          <!-- Appointment Details Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:6px;border:1px solid #e8e8e8;margin-bottom:28px;">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">SERVICE</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.service || "Salon Service"}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">DATE</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.appointmentDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">TIME</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.timeSlot}</span>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">If you need to reschedule or have any questions, please don't hesitate to reach out to us.</p>
          <div style="text-align:center;margin-bottom:8px;">
            <a href="tel:+1234567890" style="display:inline-block;background:#CF1745;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:4px;font-size:15px;font-weight:bold;">Contact Us</a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#f4f4f4;padding:24px 40px;text-align:center;border-top:1px solid #e8e8e8;">
          <p style="margin:0 0 6px;color:#888;font-size:13px;">© ${new Date().getFullYear()} E&R Salon. All rights reserved.</p>
          <p style="margin:0;color:#aaa;font-size:12px;">You received this email because you booked an appointment with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
      } else if (newStatus === "Cancelled") {
        message = `Hi ${updatedAppointment.customerName}, we're sorry but your appointment for ${updatedAppointment.appointmentDate} at ${updatedAppointment.timeSlot} has been CANCELLED. Please reach out to reschedule.`;
        html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Appointment Cancelled</title></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background-color:#CF1745;padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">E&R Salon</h1>
          <p style="margin:8px 0 0;color:#f9b3c4;font-size:14px;">Professional Beauty Services</p>
        </td></tr>
        <!-- Hero Banner -->
        <tr><td style="background-color:#fdf0f3;padding:28px 40px;text-align:center;border-bottom:3px solid #CF1745;">
          <div style="display:inline-block;background:#888;border-radius:50%;width:56px;height:56px;line-height:56px;text-align:center;font-size:28px;color:#fff;">✕</div>
          <h2 style="margin:16px 0 4px;color:#555;font-size:22px;">Appointment Cancelled</h2>
          <p style="margin:0;color:#666;font-size:15px;">We're sorry to let you go.</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 24px;color:#333;font-size:15px;">Hi <strong>${updatedAppointment.customerName}</strong>,</p>
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">Unfortunately, your appointment has been <strong style="color:#555;">cancelled</strong>. We sincerely apologize for the inconvenience. Here were your appointment details:</p>
          <!-- Appointment Details Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:6px;border:1px solid #e8e8e8;margin-bottom:28px;">
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">SERVICE</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.service || "Salon Service"}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">DATE</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.appointmentDate}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 20px;">
                <span style="color:#888;font-size:13px;display:block;margin-bottom:2px;">TIME</span>
                <span style="color:#222;font-size:15px;font-weight:bold;">${updatedAppointment.timeSlot}</span>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">We'd love to have you back! Please reach out to book a new appointment at your convenience.</p>
          <div style="text-align:center;margin-bottom:8px;">
            <a href="tel:+1234567890" style="display:inline-block;background:#CF1745;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:4px;font-size:15px;font-weight:bold;">Book Again</a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#f4f4f4;padding:24px 40px;text-align:center;border-top:1px solid #e8e8e8;">
          <p style="margin:0 0 6px;color:#888;font-size:13px;">© ${new Date().getFullYear()} E&R Salon. All rights reserved.</p>
          <p style="margin:0;color:#aaa;font-size:12px;">You received this email because you booked an appointment with us.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
      }

      if (message) {
        await sendEmail({
          email: updatedAppointment.customerEmail,
          subject: `Appointment ${newStatus} – E&R Salon`,
          message,
          html,
        });
      }
    } catch (err) {
      console.error("Email failed to send:", err);
      // We don't return error here because the DB update was already successful
    }
  }

  // Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("appointmentUpdated", updatedAppointment);
  }

  res.status(200).json({
    status: "success",
    data: {
      data: updatedAppointment,
    },
  });
});

// 3. ADMIN FUNCTIONS
exports.getAllAppointments = factory.getAll(Appointment);
exports.getAppointment = factory.getOne(Appointment);

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

  if (!deletedAppointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }

  // Emit WebSocket event
  const io = req.app.get("io");
  if (io) {
    io.emit("appointmentDeleted", req.params.id);
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
