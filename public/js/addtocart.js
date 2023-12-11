
function updateCartQuantity() {

    $.ajax({
        url: '/getcartquantity',
        method: 'GET',
        success: function (response) {
            const cartQuantityElement = document.getElementById('cart-quantity');
            cartQuantityElement.textContent = response.quantity;
        },
        error: function (error) {
            console.error('Error fetching cart quantity:', error);
        }
    });
}


document.getElementById('addToCartButton').addEventListener('click', (event) => {
    event.preventDefault();
    const productId = event.currentTarget.getAttribute('href').split('/').pop();

    $.ajax({
        url: `/add-to-cart/${productId}`,
        method: 'POST',
        success: (response) => {
            if (response.success) {
                Toastify({
                    text: "Product added to cart",
                    duration: 1000,
                    newWindow: true,
                    close: false,
                    gravity: "top", 
                    position: "center", 
                    style: {
                        background: "linear-gradient(to right, #000, #000)",
                        color: "#fff",
                        marginTop: "35px",
                    },
                }).showToast();
                    updateCartQuantity();
            } else {
                console.error('Failed to add item to the cart');
                toastr.error('Failed to add item to the cart');
            }
        },
        error: (error) => {
            console.error('AJAX request failed:', error);
            toastr.error('AJAX request failed');
        }
    });
});
