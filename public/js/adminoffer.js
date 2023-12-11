const expirationDate = document.getElementById('endDate');
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

document.getElementById('addOfferModal').addEventListener('submit', function (event) {
    if (dateError.textContent.trim() !== "") {
        event.preventDefault();
    }
});

$('#addOfferForm').submit((e) => {
    e.preventDefault();

    $.ajax({
        url: '/admin/addOffer',
        method: 'POST',
        data: $('#addOfferForm').serialize(),
        success: (response) => {
            if (response.success) {
                console.log('Offer Added Successfully');
                window.location.reload();
                $("#addOfferModal").modal("hide");
                $("#flashMessage").text("Offer added successfully").show();
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
