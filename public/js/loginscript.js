
$(document).ready(function () {
    // Variables to store the initial duration and countdown interval
    let duration = 60; // Duration in seconds
    let countdown;
  
    // References to DOM elements
    const timerDisplay = $("#timer");
    const resendOtp = $("#resendOtp");
    const otpInput = $("#number");
    const emailVerificationButton = $("#otpVerification");
  
    // Function to update the countdown timer
    function updateTimer() {
      const minutes = Math.floor(duration / 60);
      let seconds = duration % 60;
      seconds = seconds < 10 ? "0" + seconds : seconds;
  
      timerDisplay.text(`${minutes}:${seconds}`);
  
      if (duration === 0) {
        clearInterval(countdown);
        timerDisplay.text("00:00");
        resendOtp.css("display", "block");
      } else {
        duration--;
      }
    }
  
    // Initial call to display the full minute
    updateTimer();
  
    // Set up the countdown
    countdown = setInterval(updateTimer, 1000);
  
    // Event handler for OTP validation
    emailVerificationButton.click(function (e) {
      e.preventDefault(); // Prevent the form from submitting
  
      const otp = otpInput.val();
      // Use AJAX to send the OTP for validation to the server
      $.ajax({
        type: "POST",
        url: "/otpVerification", // Update with the  URL
        data: { otp:otp }, // Send OTP as data
        success: function (response) {
          console.log('Response from server:', response);
          if (response.success) {
            clearInterval(countdown);
            timerDisplay.text("OTP Validated");
  
            // redirected to homepage
  
            window.location.href='/createNewPassword'
          } else {
            // Handle unsuccessful OTP validation
            alert("Invalid OTP. Please try again.");
          }
        },
        error: function () {
          alert("An error occurred while validating OTP.");
        },
      });
      console.log('data');
    });
  });
  