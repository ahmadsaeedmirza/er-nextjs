const quantitySpan = document.getElementById("quantity");
const incrementBtn = document.getElementById("increment");
const decrementBtn = document.getElementById("decrement");

if (incrementBtn && decrementBtn) {
  incrementBtn.addEventListener("click", () => {
    let currentQty = parseInt(quantitySpan.innerText);
    const maxStock = parseInt(incrementBtn.dataset.stock) || Infinity;
    if (currentQty < maxStock) {
      quantitySpan.innerText = currentQty + 1;
    }
  });

  decrementBtn.addEventListener("click", () => {
    let currentQty = parseInt(quantitySpan.innerText);
    // Prevent going below 1
    if (currentQty > 1) {
      quantitySpan.innerText = currentQty - 1;
    }
  });
}

document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", async (e) => {
    // Get quantity from the page if available (productOne page), otherwise default to 1
    let quantity = 1;
    const quantitySpan = document.getElementById("quantity");
    if (quantitySpan) {
      quantity = parseInt(quantitySpan.innerText) || 1;
    }

    const stock = parseInt(e.target.dataset.stock) || Infinity;
    if (quantity > stock) {
      const toast = document.getElementById("toast");
      toast.innerText = "Not enough stock available!";
      toast.classList.remove("bg-[#CF1745]", "opacity-0");
      toast.classList.add("bg-red-600", "opacity-100");
      setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
      }, 3000);
      return;
    }

    const product = {
      productId: e.target.dataset.id,
      name: e.target.dataset.name,
      price: e.target.dataset.price,
      image: e.target.dataset.image,
      detail: e.target.dataset.detail,
      quantity: quantity,
    };

    try {
      const res = await axios.post("/api/cart/add", product);
      // Show custom toast instead of alert
      const toast = document.getElementById("toast");
      toast.innerText = "Item added to cart!";
      toast.classList.remove("bg-red-600", "opacity-0");
      toast.classList.add("bg-[#CF1745]", "opacity-100");
      setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
      }, 3000); // Hide after 3 seconds
      location.reload(); // Refresh to update cart header count
    } catch (err) {
      console.error("Error adding to cart:", err);
      // Show error toast
      const toast = document.getElementById("toast");
      const errorMessage =
        err.response?.data?.message ||
        "Failed to add to cart. Please try again.";
      toast.innerText = errorMessage;
      toast.classList.remove("bg-[#CF1745]", "opacity-0");
      toast.classList.add("bg-red-600", "opacity-100");
      setTimeout(() => {
        toast.classList.remove("opacity-100");
        toast.classList.add("opacity-0");
      }, 3000);
    }
  });
});
