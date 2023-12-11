
document.addEventListener("DOMContentLoaded", () => {

  const increaseButtons = document.querySelectorAll(".increase-quantity");
  const decreaseButtons = document.querySelectorAll(".decrease-quantity");
  const removeButtons = document.querySelectorAll(".remove-button");
  const makePurchase = document.querySelector('#makePurchase')
 

  // --------------------------------stock Checking before checkout-----------------------------------

  makePurchase.addEventListener('click',(event)=>{
    event.preventDefault();
    checkStock();
    
  })

  async function checkStock(){
    try {
      const response = await fetch('/checkStock',{
        method:'GET',
        headers:{
          'content-type':'application/json'
          },
      });

      console.log("inside the chcekstock front end ")
      if (response.ok) {

        let data = await response.json()

        console.log("response data is ",data)

        if(data.success){

          console.log("data is succeddfully here ");

          const cartSubmitForm = $('#cartSubmit'); 

          $.ajax({
            url: '/cartpage',
            type: 'POST',
            data: $('#cartSubmit').serialize(),
            success: function (response) {
              window.location.href = ('/checkout')
              console.log('AJAX request was successful.');
              console.log(response);
            },
            error: function (xhr, status, error) {
              console.error('AJAX request failed with status:', status);
            }
          });
        }else{
          Swal.fire({
            icon: 'error',
            title: 'Insufficient Stock',
            text: data.error,
          });
          data.itemsWithInsufficientStock.forEach(item => {

          console.log("insufficientstock inside");

          const productId = item.productId; 

          console.log(productId);

          const outOfStockMessage = document.getElementById(`outOfStockMessage_${productId}`);

          console.log("out of stock things ",outOfStockMessage);

          if (outOfStockMessage) {
            outOfStockMessage.style.display = "block";
            outOfStockMessage.textContent = `only ${item.availableQuantity} items in stock`;
          }
        });
        }
      }
    } catch (error) {
      console.error("Error checking stock :", error);
    }
  }
  
  // ---------------------------coupen buttom----------------------------------------------------------

  document.querySelector('.applyCoupon').addEventListener("click", function (e) {
  
    const couponDropdown = document.getElementById('couponDropdown');
    const selectedCouponCode = couponDropdown.value;
  
    if (!selectedCouponCode) {
      
      return;
    }
  
    const subTotal = document.getElementById("sub-total").textContent;
    checkCoupon(selectedCouponCode, subTotal);
  });
  
  
  
  async function checkCoupon(couponCode, subTotal) {
    try {
      const response = await fetch('/checkCoupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: couponCode, total: subTotal })
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Coupon applied successfully HERE:", data);
  
          const discount = parseFloat(data.discount);
          const discountCell = document.getElementById('discountCell');
          discountCell.textContent = '- ₹' + discount.toFixed(2);
          const newTotal = parseFloat(subTotal) - discount;
          const totalAmountCell = document.getElementById('totalAmountCell');

          totalAmountCell.value = newTotal.toFixed(2);
  
          Swal.fire('', 'Coupon Applied', 'success');
        } else {
          console.log("Coupon application failed:", data.error);
          
          Swal.fire({
            title: 'Coupon Error',
            text: data.error, 
            icon: 'error',
            confirmButtonText: 'OK', 
          });
          $('#flashMessage').text(data.error).show();
        }
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
    }
  }
  
  

  // ------------------------increase buttom----------------------------------------------------------

  increaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-product-id");
      const quantityInput = document.getElementById(`count_${productId}`);
      const quantity = parseInt(quantityInput.value, 10); // Corrected this line
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
      const quantity = parseInt(quantityInput.value, 10);
      const availableQuantity = parseInt(quantityInput.getAttribute("data-available-quantity"), 10);

      console.log("product id is", productId)

      if (quantity >= availableQuantity) {

        const outOfStockMessage = document.querySelector(`#outOfStockMessage_${productId}`);
        if (outOfStockMessage) {
          outOfStockMessage.style.display = 'none';
        }
      
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

  function updateTotalAmount(coupon) {
    console.log("COUPON HERE is ", coupon);
    let totalAmount = 0;

    const productRows = document.querySelectorAll(".row.gy-3.mb-4");

    productRows.forEach((row) => {
        const productId = row.querySelector(".decrease-quantity").getAttribute("data-product-id");
        const productAmount = parseFloat(row.querySelector(`#productAmount_${productId}`).textContent);
        totalAmount += productAmount;
    });

    const totalAmountCell = document.getElementById("totalAmountCell");
    const subTotal = document.getElementById("sub-total");
    const minAmountElement = document.getElementById("minAmount");

    if (coupon) {
        const minAmountValue = parseFloat(minAmountElement.value);
        console.log("minimum amount is", minAmountValue);
        console.log("total amount is", totalAmount);

        if (totalAmount < minAmountValue) {
            const swalResult = Swal.fire({
                icon: 'error',
                title: 'Your coupon is lost',
                text: `The minimum amount for your coupon is ${minAmountValue} rupees.`,
                showConfirmButton: false,
                toast: true,
                position: 'center',
                timer: 5000,
                timerProgressBar: true,
            });
        } else {
            totalAmount -= parseInt(coupon, 10);
        }
    }

    totalAmountCell.value = totalAmount.toFixed(2);
    subTotal.textContent = totalAmount.toFixed(2);
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

          
          updateTotalAmount(data.coupon);
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


