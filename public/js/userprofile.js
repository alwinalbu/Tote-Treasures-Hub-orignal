$(document).ready(function () {
    // Attach a click event handler to the change password button
    $("#changePasswordButton").click(() => {
        // Use SweetAlert to confirm the action
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
                // If the user clicks "Yes" in the SweetAlert, show the modal
                $('#changePasswordModal').modal('show');
            } else {
                // Optionally, show another SweetAlert or handle the cancellation
                Swal.fire('Password change canceled!', '', 'info');
            }
        });
    });

    // Show the modal
    $('#changePasswordModal').on('shown.bs.modal', function () {
        // Submit the form when the modal is fully shown
        $("#passwordChangeForm").submit(submitPasswordChangeForm);
    });
});

// Function to submit the password change form via AJAX
function submitPasswordChangeForm(e) {
    // Prevent form submission
    e.preventDefault();

    console.log('Form submitted!');

    // Perform AJAX request
    $.ajax({
        url: '/changepassword',
        method: 'post',
        data: $('#passwordChangeForm').serialize(),
        success: (response) => {
            if (response.success) {
                console.log('Password changed successfully');

                // Close the modal after changed successfully
                
                $('#changePasswordModal').modal('hide');

                // Useing SweetAlert for success message
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
