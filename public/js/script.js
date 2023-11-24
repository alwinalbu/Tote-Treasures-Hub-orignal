
$(document).ready(function () {
  
  let duration = 60; 
  let countdown;

 
  const timerDisplay = $("#timer");
  const resendOtp = $("#resendOtp");
  const otpInput = $("#number");
  const emailVerificationButton = $("#emailVerification");

  
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

  
  updateTimer();


  countdown = setInterval(updateTimer, 1000);

  
  emailVerificationButton.click(function (e) {
    e.preventDefault(); 

    const otp = otpInput.val();

    $.ajax({
      type: "POST",
      url: "/emailVerification", 
      data: { otp:otp }, 
      success: function (response) {

        console.log('Response from server:', response);

        if (response.success) {
          clearInterval(countdown);
          timerDisplay.text(" Otp Validated Signup Successful");
      
          var redirectUrl = response.redirectUrl;
          console.log("Redirect URL:", redirectUrl);
      
          window.location.href = redirectUrl;
      }
       else {
         
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
