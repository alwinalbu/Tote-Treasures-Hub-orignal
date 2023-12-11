$(document).ready(function () {
   
    $("#changePasswordButton").click(() => {
   
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you really want to change your password?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, change it!'
        }).then((result) => {
            if (result.isConfirmed) {
               
                $('#changePasswordModal').modal('show');
            } else {
                
                Swal.fire('Password change canceled!', '', 'info');
            }
        });
    });

    $('#changePasswordModal').on('shown.bs.modal', function () {
 
        $("#passwordChangeForm").submit(submitPasswordChangeForm);
    });
});


function submitPasswordChangeForm(e) {

    e.preventDefault();

    console.log('Form submitted!');
    $.ajax({
        url: '/changepassword',
        method: 'post',
        data: $('#passwordChangeForm').serialize(),
        success: (response) => {
            if (response.success) {
                console.log('Password changed successfully');
                
                $('#changePasswordModal').modal('hide');
       
                Swal.fire({
                    title: 'Success!',
                    text: 'Password changed successfully',
                    icon: 'success',
                });
            } else {
                
                $('#flashMessage').text(response.error).show();
                Swal.fire({
                    title: 'Error!',
                    text: response.error || 'An error occurred. Please try again.',
                    icon: 'error',
                });
            }
        },
        error: (xhr, status, error) => {
            console.log('Error:', error);

            // Use SweetAlert for generic error message
            $('#flashMessage').text('An error occurred. Please try again.').show();
            Swal.fire({
                title: 'Error!',
                text: 'An error occurred. Please try again.',
                icon: 'error',
            });
        }
    });
}
