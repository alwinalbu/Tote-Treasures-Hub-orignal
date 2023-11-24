
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
      url: '/checkout',
      method: 'post',
      data: $('#form-checkout').serialize(),
      success: (response) => {
          if (response.codSuccess) {
              window.location = '/orderSuccess';
          } else if (response.onlineSuccess) {
              console.log("reached with response as online payment here inside ajax");
              handlePayNowClick(response);
          }
      }
  });
  
})

function handlePayNowClick(order) {
   
    var options = {
      "key": "rzp_test_SpKlZZQ2JqQYDe", 
      "amount": order.createdOrder.amount, 
      "currency": "INR",
      "name": "ToteTreasures Hub", 
      "description": "Test Transaction", 
      "image": "/images/logo.png",
      "order_id": order.createdOrder.id, 
      
      "handler": function (response) {
        verifyPayment(response, order); 
      },
      "prefill": {
        "user": order.order.UserId, 
      },
      "notes": {
        "address": "Razorpay Corporate Office" 
      },
      "theme": {
        "color": "#33ccb3" 
      }
    };
   
    var rzp1 = new Razorpay(options);
    
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
  