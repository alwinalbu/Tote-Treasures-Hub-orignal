
  $(document).ready(function() {
    
    $('#filterForm').submit(function(event) {
      
      event.preventDefault();

      var formData = $(this).serialize();

      $.ajax({
        type: 'GET', 
        url: '/filter', 
        data: formData,
        success: function(response) {
          
          console.log('Filter applied successfully:', response);

          $('#filterModal').modal('hide');
          window.location.href = '/filtered';
        },
        error: function(error) {
          
          console.error('Error applying filter:', error);
        }
      });
    });
  });
