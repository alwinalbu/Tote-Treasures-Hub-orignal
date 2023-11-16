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
