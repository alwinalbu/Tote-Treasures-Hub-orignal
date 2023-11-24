

function changeOrderStatus(orderId, index) {
  const statusSelect = document.getElementById(`statusSelect${index}`);
  const newStatus = statusSelect.value;

  console.log("status update button insdide ");
  console.log("new status is ",newStatus);
  
  console.log('Updating order status:', orderId, newStatus);
  
  fetch(`/admin/order/updatestatus/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: newStatus }),

  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Order status updated:', data);
      location.reload();
    })
    .catch(error => {
      console.error('Error updating order status:', error);

      // Handle the error here, possibly showing a user-friendly message
    });
}

// ------------------------Cancel The Return Request--------------------------------------------------------------------

function cancelReturn(orderId){

  console.log("reached inside the function onl=click CANCEL the RETURN");

  fetch(`/admin/orders/cancelReturn/${orderId}`,{
    method:'PUT',
    headers:{
      'Content-Type':'application/json',
    },
  })
  .then((response)=>response.json())
  .then((data)=>{
    if(data.success){
      alert('Return request canceled successfully!');
      location.reload();
    }else{
      alert('Failed to cancel return request.');
    }
  })
  .catch((error)=>{
    console.error('Error:', error);
  })
}

// ---------------------------------------Accept the Return Rquest-------------------------------------------------------------

function acceptReturn(orderId) {
  console.log("Reached inside the function on click Acceptance");

  fetch(`/admin/orders/acceptReturn/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      console.log("Return Acceptance response is:", response);
      return response.text();  // Instead of response.json()
    })
    .then((responseText) => {
      console.log("Response Text:", responseText);  // Log the response text

      if (responseText.includes('error')) {
        alert('Failed to accept return request.');
      } else {
        alert('Return request accepted successfully!');
        location.reload();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}



