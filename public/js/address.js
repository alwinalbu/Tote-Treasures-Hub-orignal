document.addEventListener("DOMContentLoaded", () => {
    const removeButtons = document.querySelectorAll(".remove-button");

    removeButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            
             console.log("delete adress here");
            // Get the address ID from the href attribute of the button
            // const addressId = button.getAttribute('href').split('/').pop();

            // Log the address ID to the console for debugging
            // console.log('Address ID:', addressId);

            Swal.fire({
                title: "Remove Address",
                text: "Are you sure you want to remove this Address?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, remove it",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Construct the URL for deleting the address
                    // const deleteURL = `/deleteAddress/${addressId}`;
                    
                    // Redirect to the delete address URL
                    // window.location.href = deleteURL;

                    window.location.href = button.href;
                }
            });
        });
    });
});
