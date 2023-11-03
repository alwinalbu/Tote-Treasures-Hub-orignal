document.addEventListener("DOMContentLoaded", () => {

  const increaseButtons = document.querySelectorAll(".increase-quantity");
  const decreaseButtons = document.querySelectorAll(".decrease-quantity");
  const removeButtons = document.querySelectorAll(".remove-button");

  // ------------------------increase buttom------------------------
  increaseButtons.forEach((button) => {

    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      const quantityInput = document.getElementById(`count_${productId}`);
      const quantity = parseInt(quantityInput.ariaValueMax, 10);
      const availableQuantity = parseInt(quantityInput.getAttribute("data-available-quantity"), 10);

      console.log("product id is", productId)

      if (quantity >= availableQuantity) {

        const outOfStockMessage = document.querySelector(`#outOfStockMessage_${productId}`);
        if (outOfStockMessage) {
          outOfStockMessage.style.display = 'block';
        }
        return;
      }

      updateQuantity(productId, 1);

    });

  });
  // --------------------------------------------decrese button---------------------------------------------------

  decreaseButtons.forEach((button) => {

    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      const quantityInput = document.getElementById(`count_${productId}`);
      const quantity = parseInt(quantityInput.ariaValueMax, 10);
      const availableQuantity = parseInt(quantityInput.getAttribute("data-available-quantity"), 10);

      console.log("product id is", productId)

      if (quantity >= availableQuantity) {

        const outOfStockMessage = document.querySelector(`#outOfStockMessage_${productId}`);
        if (outOfStockMessage) {
          outOfStockMessage.style.display = 'none';
        }
        return;
      }

      updateQuantity(productId, -1);

    });

  });


  // ----------------------------------------------remove function --------------------------------------------


  removeButtons.forEach((button) => {

    console.log("reached here ")

    button.addEventListener("click", (event) => {
      event.preventDefault();

      Swal.fire({
        title: "Remove Product",
        text: "Are you sure you want to remove this product from your cart?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, remove it",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = button.href;
        }
      });
    });
  });


  // -----------------------function of total amount---------------------------------------

  function updateTotalAmount() {

    let totalAmount = 0;

    const productRows = document.querySelectorAll(".row.gy-3.mb-4");

    productRows.forEach((row) => {

      const productId = row.querySelector(".decrease-quantity").getAttribute("data-product-id");

      const quantityInput = row.querySelector(`#count_${productId}`);

      const quantity = parseInt(row.querySelector(`#count_${productId}`).value, 10)

      const productAmount = parseFloat(row.querySelector(`#productAmount_${productId}`).textContent);

      totalAmount += productAmount;

    });

    const totalAmountCell = document.getElementById("totalAmountCell");
    const subTotal = document.getElementById("sub-total");
    const hiddenTotalAmount = document.getElementById('hiddenTotalAmount');

    totalAmountCell.value = `${totalAmount.toFixed(2)}`;

    subTotal.textContent = `${totalAmount.toFixed(2)}`;

    hiddenTotalAmount.value = totalAmount.toFixed(2);


  }



  //------------------------ Function to send AJAX request to update quantity------------------------

  async function updateQuantity(productId, change) {

    try {
      const response = await fetch("/updateQuantity", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, change }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("new quantity is ", data.newQuantity);

        const quantityInput = document.getElementById(`count_${productId}`);

        const productAmount = document.getElementById(`productAmount_${productId}`);

        const existingValue = productAmount.getAttribute("data-value");

        if (quantityInput) {
          quantityInput.value = data.newQuantity;
          productAmount.textContent = existingValue * data.newQuantity;

          // Calculate and update the total amount
          updateTotalAmount();
        }
      } else {
        console.error("Error updating quantity:", response.statusText);
      }

    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  updateTotalAmount();

});








