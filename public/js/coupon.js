const expirationDate = document.getElementById('expirationDate');
const dateError = document.getElementById('dateError');

expirationDate.addEventListener('input', function () {
    const selectedDate = new Date(expirationDate.value);
    const currentDate = new Date();

    if (selectedDate < currentDate) {
        dateError.textContent = "Please select a future date.";
        expirationDate.setCustomValidity("Please select a future date.");
    } else {
        dateError.textContent = "";
        expirationDate.setCustomValidity("");
    }
});

document.getElementById('addCouponForm').addEventListener('submit', function (event) {
    
    if (dateError.textContent.trim() !== "") {
        event.preventDefault();
    }
});

$('#addCouponForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/admin/addCoupon',
        method: 'POST',
        data: $('#addCouponForm').serialize(),
        success: (response) => {
            if (response.success) {
                console.log('Coupon Added Successfully');
                window.location.reload();
                $("#addCouponModal").modal("hide");
                $("#flashMessage").text("Coupon added successfully").show();
            } else {
                console.log(response.error);
                $("#flashMessage").text(response.error).show();
            }
        },
        error: (xhr, status, error) => {
            console.log("Error:", error);
            $("#flashMessage")
                .text("An error occurred. Please try again.")
                .show();
        },
    });
});

// --------------------------------------------------Edit Coupon----------------------------------------------------

// const editExpirationDate = document.getElementById('editExpirationDate');
// const editDateError = document.getElementById('editDateError');

// expirationDate.addEventListener('input', function () {
//     const selectedDate = new Date(editExpirationDate.value);
//     const currentDate = new Date();

//     if (selectedDate < currentDate) {
//         editDateError.textContent = "Please select a future date.";
//         editExpirationDate.setCustomValidity("Please select a future date.");
//     } else {
//         editDateError.textContent = "";
//         editExpirationDate.setCustomValidity("");
//     }
// });


// document.getElementById('editCouponForm').addEventListener('submit', function (event) {
    
//   if (editDateError.textContent.trim() !== "") {
//       event.preventDefault();
//   }
// });
// $('#editCouponForm').submit((e) => {
//   e.preventDefault();

//   $.ajax({
//       url: '/admin/updateCoupon',
//       method: 'PUT',  // Change the method to PUT
//       data: $('#editCouponForm').serialize(),
//       success: (response) => {
//           if (response.success) {
//               console.log('Coupon Updated Successfully');
//               window.location.reload();
//               $("#editModal").modal("hide");
//               $("#editFlashMessage").text("Coupon updated successfully").show();
//           } else {
//               console.log(response.error);
//               $("#editFlashMessage").text(response.error).show();
//           }
//       },
//       error: (xhr, status, error) => {
//           console.log("Error:", error);
//           $("#editFlashMessage")
//               .text("An error occurred. Please try again.")
//               .show();
//       },
//   });
// });


// -------------------------------delete Coupon------------------------------------------------------------------

    // function confirmDelete(couponId) {
    //     Swal.fire({
    //         title: 'Are you sure?',
    //         text: 'You won\'t be able to revert this!',
    //         icon: 'warning',
    //         showCancelButton: true,
    //         confirmButtonColor: '#d33',
    //         cancelButtonColor: '#3085d6',
    //         confirmButtonText: 'Yes, delete it!'
    //     }).then((result) => {
    //         if (result.isConfirmed) {
                
    //             deleteCoupon(couponId);
    //         }
    //     });
    // }

   
    //   function deleteCoupon(couponId) {
       
    //     $.ajax({
    //         url: `/admin/deleteCoupon/${couponId}`, 
    //         type: 'DELETE',
    //         dataType: 'json',
    //         success: function (data) {
    //             if (data.success) {
                    
    //                 Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
                    
    //                 location.reload();
    //             } else {
                   
    //                 Swal.fire('Error', 'Failed to delete coupon.', 'error');
    //             }
    //         },
    //         error: function (xhr, status, error) {
    //             console.error('AJAX request failed:', status, error);
                
    //             Swal.fire('Error', 'An error occurred while deleting the coupon.', 'error');
    //         }
    //     });
    // }
   


