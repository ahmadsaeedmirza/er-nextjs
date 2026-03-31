const mongoose = require("mongoose");
const validator = require("validator");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Email field is required"],
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    whatsappNumber: {
      type: String,
      required: [true, "Phone number is required"],
    },
    appointmentDate: {
      type: Date,
      required: [true, "Appoitment date is required"],
    },
    timeSlot: {
      type: String,
      required: [true, "Timeslot is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    googleEventId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    service: {
      type: String,
      required: [true, "Service type is required"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// VIRTUAL: Combine date and time into a readable string
appointmentSchema.virtual("fullAppointmentTime").get(function () {
  return `${this.appointmentDate.toDateString()} at ${this.timeSlot}`;
});

// MIDDLEWARE: Ensure WhatsApp number is formatted correctly
appointmentSchema.pre("save", function () {
  if (this.whatsappNumber) {
    this.whatsappNumber = this.whatsappNumber.replace(/\s+/g, "");

    if (!this.whatsappNumber.startsWith("+")) {
      this.whatsappNumber = `+1${this.whatsappNumber}`;
    }
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
