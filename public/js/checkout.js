$(document).ready(function() {
    $('input[name="Address"]').on('change', function() {
        $('input[name="Address"]').removeAttr('checked'); // Unchecks all addresses
        $(this).prop('checked', true); // Checks the clicked address
    });
});

$("#form-checkout").submit((e)=>{
    e.preventDefault()
    const selectedAddress=$("input[name='Address']:checked").val();

    if(!selectedAddress){
        Swal.fire({
            icone:"error",
            title:"Oops...",
            text:"Please Add An Address Before Confirming The Order.",
        });
        return
    }
    $.ajax({
        url:'/checkout',
        method:'post',
        data:$('#form-checkout').serialize(),
        success:(response)=>{
            if(response.codSuccess){
                window.location='/orderSuccess'
            }else{
                handlePayNowClick(response)
            }
        }
    })
})

function handlePayNowClick(order) {
    // Define the options required for the payment
    var options = {
      "key": "rzp_test_SpKlZZQ2JqQYDe", // Your Razorpay API Key
      "amount": order.createdOrder.amount, // The amount to be charged, extracted from the created order
      "currency": "INR",
      "name": "ToteTreasures Hub", 
      "description": "Test Transaction", 
      "image": "/images/logo.png",
      "order_id": order.createdOrder.id, // The ID of the order
      // Handler function to be executed when the payment process is completed
      "handler": function (response) {
        verifyPayment(response, order); // Call a function to verify the payment using the response data and the order details
      },
      "prefill": {
        "user": order.order.UserId, // Pre-fill information about the user (in this case, user ID from the order)
      },
      "notes": {
        "address": "Razorpay Corporate Office" 
      },
      "theme": {
        "color": "#33ccb3" 
      }
    };
    
    // Create a new instance of Razorpay with the provided options
    var rzp1 = new Razorpay(options);
    
    // Open the payment dialog/iframe for the user to proceed with the payment
    rzp1.open();
  }

  function verifyPayment(payment, order) {
    console.log('now in verifyPayment')

    $.ajax({
      url: '/verify-payment',
      data: {
        payment,
        order
      },
      method: 'post',
      success: (response) => {
        if (response.success) {
          console.log('Payment successful');
          location.href = '/orderSuccess';
        // } else if (response.insufficientFunds) {
        //   console.log('Insufficient funds');
        //   Swal.fire({
        //     icon: 'error',
        //     title: 'Payment Failed',
        //     text: 'Insufficient funds. Please choose a different payment method or add sufficient funds to your account.'
        //   });
        } else {
          console.log('Other payment error');
          Swal.fire({
            icon: 'error',
            title: 'Payment Failed',
            text: 'There was an error processing your payment. Please try again later or contact support.'
          });
        }
      },
      error: () => {
        console.log('AJAX request failed');
        Swal.fire({
          icon: 'error',
          title: 'Request Failed',
          text: 'There was an issue processing your request. Please try again later.'
        });
      }
    });
  }
  