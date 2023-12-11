
$(document).ready(function() {
    $('input[name="Address"]').on('change', function() {
        $('input[name="Address"]').removeAttr('checked'); 
        $(this).prop('checked', true); 
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
      success: (data) => {
        if (data.cartEmpty) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Your cart is empty. Please add items to your cart before checking out.',
                showCancelButton: true,
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/shop';
                }
            });
        } else if (data.codSuccess) {
          
           console.log("reached with response as COD payment here inside ajax");
          
            window.location = '/orderSuccess';

        } else if (data.onlineSuccess) {

            console.log("reached with response as online payment here inside ajax");
            handlePayNowClick(data);

        } else if (data.walletSuccess) {
            
            
           console.log("reached with response as wallet payment success here inside ajax");
            window.location = '/orderSuccess';

        } else if (data.walletSuccess === false) {

            Swal.fire({
                icon: 'error',
                title: 'Wallet Payment Failed',
                text: 'There was an issue processing your wallet payment. Please try again or choose a different payment method.',
                showCancelButton: true,
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                  window.location.href = '/shop';
                }
            });
        }
    },
    
      error: (error) => {
          // Log detailed error information
          console.error('AJAX request failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Your cart is empty. Please add items to your cart before checking out.',
            showCancelButton: true,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/shop';
            }
        });
      },
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
   
    if (typeof Razorpay !== 'undefined') {
      var rzp1 = new Razorpay(options);
      rzp1.open();
  } else {
      console.error('Razorpay script not loaded');
  }
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
  
// $(document).ready(function () {
//   $('input[name="Address"]').on('change', function () {
//       $('input[name="Address"]').removeAttr('checked'); // Unchecks all addresses
//       $(this).prop('checked', true); // Checks the clicked address
//   });
// });

// $("#form-checkout").submit((e) => {
//   e.preventDefault();
//   const selectedAddress = $("input[name='Address']:checked").val();

//   if (!selectedAddress) {
//       Swal.fire({
//           icon: "error",
//           title: "Oops...",
//           text: "Please Add An Address Before Confirming The Order.",
//       });
//       return;
//   }
//   $.ajax({
//     url: '/checkout', // Update this to the correct URL
//     method: 'post',
//     data: $('#form-checkout').serialize(),
//     success: (response) => {
//         if (response.codSuccess) {
//             window.location = '/orderSuccess';
//         } else if (response.onlineSuccess) {
//             console.log("reached with response as online payment here inside ajax");
//             handlePayNowClick(response);
//         }
//     },
//     error: (error) => {
//         // Log detailed error information
//         console.error('AJAX request failed:', error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Request Failed',
//             text: 'There was an issue processing your request. Please check the console for more details.'
//         });
//     }
// });


// });

// function handlePayNowClick(order) {
//   var options = {
//       "key": "your_actual_razorpay_key_here",
//       "amount": order.createdOrder.amount,
//       "currency": "INR",
//       "name": "ToteTreasures Hub",
//       "description": "Test Transaction",
//       "image": "/images/logo.png",
//       "order_id": order.createdOrder.id,

//       "handler": function (response) {
//         console.log('reached inside of handlepaynowclick');
//           verifyPayment(response, order);
//       },
//       "prefill": {
//           "user": order.order.UserId,
//       },
//       "notes": {
//           "address": "Razorpay Corporate Office"
//       },
//       "theme": {
//           "color": "#33ccb3"
//       }
//   };

//   // Check if Razorpay is defined
//   if (typeof Razorpay !== 'undefined') {
//       var rzp1 = new Razorpay(options);

//       rzp1.open();
//   } else {
//       console.error('Razorpay script not loaded');
//       console.log("error here ")
//   }
// }


// async function verifyPayment(payment, order) {
//     console.log('now in verifyPayment');
  
//     try {
//       const response = await $.ajax({
//         url: '/verify-payment',
//         data: {
//           payment,
//           order
//         },
//         method: 'post'
//       });
  
//       if (response.success) {
//         console.log('Payment successful');
//         location.href = '/orderSuccess';
//       } else {
//         console.log('Other payment error');
//         Swal.fire({
//           icon: 'error',
//           title: 'Payment Failed',
//           text: 'There was an error processing your payment. Please try again later or contact support.'
//         });
//       }
//     } catch (error) {
//       console.log('AJAX request failed:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Request Failed',
//         text: 'There was an issue processing your request. Please try again later.'
//       });
//     }
//   }
  