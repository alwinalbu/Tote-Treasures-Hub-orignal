const expirationDate =document.getElementById('expirationDate')
const dateError=document.getElementById('dateError');

expirationDate.addEventListener('input',function(){
 
    const selectedDate=new Date(expirationDate.value);
    const currentDate=new Data();
  
    if (selectedDate < currentDate) {
        dateError.textContent = "Please select a future date.";
        expirationDate.setCustomValidity("Please select a future date.");
      } else {
        dateError.textContent = "";
        expirationDate.setCustomValidity("");
      }

})