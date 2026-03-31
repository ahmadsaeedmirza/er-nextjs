document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitButton = document.getElementById("loginSubmit");

  if (!form || !emailInput || !passwordInput || !submitButton) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showToast("Please enter email and password", "error");
      return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Signing in...";

    try {
      const response = await axios.post("/api/v1/admin/login", {
        email,
        password,
      });

      if (response.data?.status === "success") {
        showToast("Login successful");
        window.setTimeout(() => {
          window.location.assign("/manageAppointments");
        }, 500);
      } else {
        showToast("Unable to login. Please try again.", "error");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid email or password";
      showToast(errorMessage, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });

  function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.remove("bg-red-600", "bg-[#CF1745]", "opacity-0");
    toast.classList.add(type === "error" ? "bg-red-600" : "bg-[#CF1745]");
    toast.classList.add("opacity-100");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("opacity-100");
      toast.classList.add("opacity-0");
    }, 3500);
  }
});
