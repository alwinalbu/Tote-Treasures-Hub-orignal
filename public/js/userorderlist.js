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

async function downloadInvoice(orderId) {
    let timerInterval
    Swal.fire({
      title: 'Download Started!',
      html: 'I will close in <b></b> milliseconds.',
      timer: 4000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading()
        const b = Swal.getHtmlContainer().querySelector('b')
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft()
        }, 100)
      },
      willClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
      }
    })
    try {
        const response = await fetch('/download-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId }),
        });

        if (response.ok) {
            console.log("Response of order is ", response);

            window.location.href = `/download-invoice/${orderId}`;
        } else {
            // If the response status is not within the range 200-299
            throw new Error(`Failed to download invoice. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error in Order", error);

        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to download the invoice. Please try again later.'
        });
    }
}

function submitReturnReason(orderId, event) {
    event.preventDefault();

    console.log(`Trying to get element with ID: returnReason_${orderId}`);

    let reason = document.getElementById(`returnReason_${orderId}`).value;

    console.log("Reached inside, the reason is:", reason);
    console.log("Before AJAX Request");

    try {
        $.ajax({
            url: `/order/return/${orderId}`,
            type: 'POST',
            data: {
                returnReason: reason,
                orderId: orderId
            },
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.message,
                }).then(() => {
                    $(`#returnReasonModal${orderId}`).modal('hide');
                    location.reload();
                });
            },
            error: function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.responseJSON.error,
                });
            },
        });
    } catch (error) {
        console.error("An error occurred during the AJAX request:", error);
    }

    console.log("After AJAX Request");
}


function cancelReturnRequest(orderId) {
    $.ajax({
        url: `/order/cancelRequest/${orderId}`,
        type: "post",
        success: function (response) {
            
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.message,
            }).then(() => {
                
                location.reload(true);
            });
        },
        error: function (error) {
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.responseJSON.error,
            });
        },
    });
}

