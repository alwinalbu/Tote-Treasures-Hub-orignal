document.addEventListener('click', function(event) {
    if (event.target.classList.contains('remove-button')) {
        const orderId = event.target.getAttribute('data-order-id');

        Swal.fire({
            title: 'Are you sure?',
            text: 'Are you sure you want to cancel this order?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch('/order/cancelorder/' + orderId, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                       
                    }
                })
                .then(response => {
                    if (response.ok) {
                        
                        window.location.reload();
                    } else {
                        
                        throw new Error('Failed to cancel order');
                    }
                })
                .catch(error => {
                    // Handle network errors or other issues
                    console.error('Error:', error);
                   
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to cancel the order. Please try again later.'
                    });
                });
            }
        });
    }
});
