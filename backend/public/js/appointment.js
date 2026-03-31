// appointment.js - Handle appointment booking form submission

document.addEventListener("DOMContentLoaded", function () {
  const confirmButton = document.querySelector('button[type="button"]');
  const form = document.querySelector("form");

  if (!confirmButton) return;

  confirmButton.addEventListener("click", async function (e) {
    e.preventDefault();

    // Get form data
    const nameInput = form.querySelector('input[placeholder="Your Name"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const emailInput = form.querySelector('input[type="email"]');
    const serviceSelect = document.getElementById("serviceSelect");

    // Get selected date and time from global variables (set by calendar.js)
    const selectedDateObj =
      typeof selectedDate !== "undefined" ? selectedDate : null;
    const selectedTimeText =
      typeof selectedTime !== "undefined" ? selectedTime : null;

    // Validate required fields
    if (!nameInput.value.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (!phoneInput.value.trim()) {
      showToast("Please enter your phone number", "error");
      return;
    }

    if (!emailInput.value.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    if (!serviceSelect.value) {
      showToast("Please select a service", "error");
      return;
    }

    if (!selectedDateObj) {
      showToast("Please select a date", "error");
      return;
    }

    if (!selectedTimeText) {
      showToast("Please select a time", "error");
      return;
    }

    // Prepare data for API
    const appointmentData = {
      customerName: nameInput.value.trim(),
      customerEmail: emailInput.value.trim(),
      whatsappNumber: phoneInput.value.trim(),
      service: serviceSelect.value,
      appointmentDate: formatDateForAPI(selectedDateObj),
      timeSlot: formatTimeFor24Hour(selectedTimeText),
    };

    try {
      // Show loading state
      confirmButton.disabled = true;
      confirmButton.innerHTML = "<span>Booking...</span>";

      const response = await axios.post(
        "/api/v1/appointments/book",
        appointmentData,
      );

      if (response.data.status === "success") {
        showToast("Appointment booked successfully!", "success");
        // Reset form
        form.reset();
        // Reset selections
        document.getElementById("selectedDate").textContent = "Select a date";
        document.getElementById("selectedTime").textContent = "Select a time";
        document.getElementById("selectedService").textContent =
          "Select a service";
        document.getElementById("selectedPrice").textContent = "$0.00";
        // Clear selected states
        document
          .querySelectorAll(".selected-date")
          .forEach((el) => el.classList.remove("selected-date"));
        document
          .querySelectorAll(".selected-time")
          .forEach((el) => el.classList.remove("selected-time"));
      }
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to book appointment. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      // Reset button state
      confirmButton.disabled = false;
      confirmButton.innerHTML =
        '<span class="uppercase tracking-widest">Confirm Appointment <i class="fa-solid fa-arrow-right pl-2"></i></span>';
    }
  });
});

// Helper function to format date for API (expects YYYY-MM-DD)
function formatDateForAPI(dateObj) {
  // dateObj should be a JavaScript Date object from calendar.js
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    console.error("Invalid date object:", dateObj);
    return null;
  }
  // Format as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to convert 12-hour time format to 24-hour format
function formatTimeFor24Hour(timeString) {
  // Expecting format like "10:00 AM" or "2:30 PM"
  if (!timeString) return null;

  const [time, modifier] = timeString.trim().split(" ");
  if (!time || !modifier) return null;

  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier === "AM" && hours === 12) {
    hours = 0;
  }

  // Return format HH:MM
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Toast notification function
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.classList.remove("bg-red-600", "bg-[#CF1745]", "opacity-0");
  toast.classList.add(
    type === "error" ? "bg-red-600" : "bg-[#CF1745]",
    "opacity-100",
  );

  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
  }, 5000); // Show for 5 seconds
}
