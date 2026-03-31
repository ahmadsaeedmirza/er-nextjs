let currentDate = new Date();
let selectedDate = null;
let selectedTime = null;

// business hours per weekday (matching footer schedule)
const openingHours = {
  Sunday: { start: "09:00 AM", end: "02:00 PM" },
  Monday: { start: "09:00 AM", end: "05:00 PM" },
  Tuesday: { start: "09:00 AM", end: "05:00 PM" },
  Wednesday: { start: "09:00 AM", end: "05:00 PM" },
  Thursday: { start: "09:00 AM", end: "06:30 PM" },
  Friday: { start: "08:00 AM", end: "06:30 PM" },
  Saturday: { start: "08:00 AM", end: "05:00 PM" },
};

function parseTime(str) {
  // converts "hh:mm AM/PM" to minutes since midnight
  const [time, modifier] = str.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function filterTimeSlots() {
  if (!selectedDate) return;
  const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  const hours = openingHours[dayName];
  if (!hours) return;
  const start = parseTime(hours.start);
  const end = parseTime(hours.end);

  document.querySelectorAll("#timeSlots button").forEach((btn) => {
    const t = parseTime(btn.textContent.trim());
    if (t >= start && t <= end) {
      btn.style.display = "";
    } else {
      btn.style.display = "none";
      if (btn.classList.contains("bg-[#CF1745]")) {
        btn.classList.remove("bg-[#CF1745]", "text-white");
        selectedTime = null;
      }
    }
  });
}

function updateSummary() {
  const serviceSelect = document.getElementById("serviceSelect");
  const selectedService = serviceSelect.value;
  const price = servicePrices[selectedService] || 0;

  document.getElementById("selectedDate").textContent = selectedDate
    ? selectedDate.toLocaleDateString()
    : "Select a date";
  document.getElementById("selectedTime").textContent = selectedTime
    ? `at ${selectedTime}`
    : "Select a time";
  document.getElementById("selectedService").textContent =
    selectedService || "Select a service";
  document.getElementById("selectedPrice").textContent = price
    ? `$${price}.00`
    : "$0.00";
}

function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  calendarDays.innerHTML = ""; // Clear existing

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById("monthDisplay").innerText =
    currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill empty slots
  for (let i = 0; i < firstDay; i++) {
    calendarDays.innerHTML += '<div class="h-14"></div>';
  }

  // Fill days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    const isSelected =
      selectedDate &&
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate();
    const classes = isPast
      ? "h-14 flex items-center justify-center text-slate-300 cursor-not-allowed"
      : `h-14 border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-all ${isSelected ? "bg-[#CF1745] text-white" : "bg-white/40"}`;

    calendarDays.innerHTML += `<div class="${classes}" data-date="${year}-${month}-${day}">${day}</div>`;
  }

  // Add event listeners to days
  document
    .querySelectorAll("#calendarDays > div[data-date]")
    .forEach((dayDiv) => {
      dayDiv.addEventListener("click", () => {
        const dateStr = dayDiv.getAttribute("data-date");
        // parse "year-month-day" so timezone won't shift the day
        const [y, m, d] = dateStr.split("-").map(Number);
        const date = new Date(y, m, d);
        if (date < new Date().setHours(0, 0, 0, 0)) return; // Prevent selecting past dates
        selectedDate = date;

        // clear previous time selection whenever date changes
        selectedTime = null;
        document.querySelectorAll("#timeSlots button").forEach((btn) => {
          btn.classList.remove("bg-[#CF1745]", "text-white");
        });

        renderCalendar(); // Re-render to show selection
        updateSummary();
        filterTimeSlots();
      });
    });
}

document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Time slots
document.querySelectorAll("#timeSlots button").forEach((button) => {
  button.addEventListener("click", () => {
    // Remove selected class from all and restore default bg
    document.querySelectorAll("#timeSlots button").forEach((btn) => {
      btn.classList.remove("bg-[#CF1745]", "text-white");
      if (!btn.classList.contains("bg-white/40"))
        btn.classList.add("bg-white/40");
    });
    // Add selected styling to clicked button
    button.classList.remove("bg-white/40");
    button.classList.add("bg-[#CF1745]", "text-white");
    selectedTime = button.textContent.trim();
    updateSummary();
  });
});

// Service select
document
  .getElementById("serviceSelect")
  .addEventListener("change", updateSummary);

// Initial update
updateSummary();
filterTimeSlots();

renderCalendar();
