const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

// Function to show/hide
const toggleSidebar = () => {
  sidebar.classList.toggle("-translate-x-full");
  sidebar.classList.toggle("hidden");
  sidebar.classList.toggle("flex");

  // Toggle the buttons themselves
  openBtn.classList.toggle("hidden");
  closeBtn.classList.toggle("hidden");
};

openBtn.addEventListener("click", toggleSidebar);
closeBtn.addEventListener("click", toggleSidebar);

